'''
ARCHES - a program developed to inventory and manage immovable cultural heritage.
Copyright (C) 2013 J. Paul Getty Trust and World Monuments Fund

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as
published by the Free Software Foundation, either version 3 of the
License, or (at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public License
along with this program. If not, see <http://www.gnu.org/licenses/>.
'''

import re
import os
import json
from django.template import RequestContext
from django.shortcuts import render_to_response, redirect
from django.conf import settings
from django.contrib.auth.decorators import permission_required
from django.views.decorators.csrf import csrf_exempt
from arches.app.models import models
from arches.app.models.resource import Resource
from arches.app.utils.betterJSONSerializer import JSONSerializer, JSONDeserializer
from arches.app.utils.JSONResponse import JSONResponse
from arches.app.views.concept import get_preflabel_from_valueid
from arches.app.views.concept import get_preflabel_from_conceptid
from arches.app.search.search_engine_factory import SearchEngineFactory
from arches.app.search.elasticsearch_dsl_builder import Query, Terms, Bool, Match
from ead.models.concept import Concept
from django.db.models import Max, Min
from django.db import transaction

@permission_required('ead.edit')
@csrf_exempt
def resource_manager(request, resourcetypeid='', form_id='default', resourceid=''):

    if resourceid != '':
        resource = Resource(resourceid)
    elif resourcetypeid != '':
        resource = Resource({'entitytypeid': resourcetypeid})

    if form_id == 'default':
        form_id = resource.form_groups[0]['forms'][0]['id']

    form = resource.get_form(form_id)

    if request.method == 'DELETE':
        resource.delete_index()
        se = SearchEngineFactory().create()
        realtionships = resource.get_related_resources(return_entities=False)
        for realtionship in realtionships:
            se.delete(index='resource_relations', doc_type='all', id=realtionship.resourcexid)
            realtionship.delete()
        resource.delete()
        return JSONResponse({ 'success': True })

    if request.method == 'POST':
        data = JSONDeserializer().deserialize(request.POST.get('formdata', {}))
        form.update(data, request.FILES)

        with transaction.atomic():
            if resourceid != '':
                resource.delete_index()
            resource.save(user=request.user)
            resource.index()
            resourceid = resource.entityid

            return redirect('resource_manager', resourcetypeid=resourcetypeid, form_id=form_id, resourceid=resourceid)

    min_max_dates = models.Dates.objects.aggregate(Min('val'), Max('val'))
    
    if request.method == 'GET':
        if form != None:
            lang = request.GET.get('lang', settings.LANGUAGE_CODE)
            form.load(lang)
            return render_to_response('resource-manager.htm', {
                    'form': form,
                    'formdata': JSONSerializer().serialize(form.data),
                    'form_template': 'views/forms/' + form_id + '.htm',
                    'form_id': form_id,
                    'resourcetypeid': resourcetypeid,
                    'resourceid': resourceid,
                    'main_script': 'resource-manager',
                    'active_page': 'ResourceManger',
                    'resource': resource,
                    'resource_name': resource.get_primary_name(),
                    'resource_type_name': resource.get_type_name(),
                    'form_groups': resource.form_groups,
                    'min_date': min_max_dates['val__min'].year if min_max_dates['val__min'] != None else 0,
                    'max_date': min_max_dates['val__max'].year if min_max_dates['val__min'] != None else 1,
                    'timefilterdata': JSONSerializer().serialize(Concept.get_time_filter_data()),
                },
                context_instance=RequestContext(request))
        else:
            return HttpResponseNotFound('<h1>Arches form not found.</h1>')

def report(request, resourceid):
    lang = request.GET.get('lang', request.LANGUAGE_CODE)
    se = SearchEngineFactory().create()
    report_info = se.search(index='resource', id=resourceid)
    report_info['source'] = report_info['_source']
    report_info['type'] = report_info['_type']
    report_info['source']['graph'] = report_info['source']['graph']
    del report_info['_source']
    del report_info['_type']
    
    primary_label = settings.RESOURCE_TYPE_CONFIGS()[report_info['type']]['primary_name_lookup']['lookup_value'][1]
    print "primary_label",primary_label

    def get_evaluation_path(valueid):
        value = models.Values.objects.get(pk=valueid)
        concept_graph = Concept().get(id=value.conceptid_id, include_subconcepts=False, 
            include_parentconcepts=True, include_relatedconcepts=False, up_depth_limit=None, lang=lang)
        
        paths = []
        for path in concept_graph.get_paths(lang=lang)[0]:
            if path['label'] != 'Arches' and path['label'] != 'Evaluation Criteria Type':
                paths.append(path['label'])
        return '; '.join(paths)


    concept_label_ids = set()
    uuid_regex = re.compile('[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}')
    # gather together all uuid's referenced in the resource graph
    def crawl(items):
        for item in items:
            for key in item:
                if isinstance(item[key], list):
                    crawl(item[key])
                else:
                    if isinstance(item[key], basestring) and uuid_regex.match(item[key]):
                        if key == 'EVALUATION_CRITERIA_TYPE_E55__value':
                            item[key] = get_evaluation_path(item[key])
                        concept_label_ids.add(item[key])

    crawl([report_info['source']['graph']])

    # get all the concept labels from the uuid's
    concept_labels = se.search(index='concept_labels', id=list(concept_label_ids))

    # convert all labels to their localized prefLabel
    temp = {}
    if concept_labels != None:
        for concept_label in concept_labels['docs']:
            #temp[concept_label['_id']] = concept_label
            if concept_label['found']:
                # the resource graph already referenced the preferred label in the desired language
                if concept_label['_source']['type'] == 'prefLabel' and concept_label['_source']['language'] == lang:
                    temp[concept_label['_id']] = concept_label['_source']
                else: 
                    # the resource graph referenced a non-preferred label or a label not in our target language, so we need to get the right label
                    temp[concept_label['_id']] = get_preflabel_from_conceptid(concept_label['_source']['conceptid'], lang)

    # replace the uuid's in the resource graph with their preferred and localized label                    
    def crawl_again(items):
        for item in items:
            for key in item:
                if isinstance(item[key], list):
                    crawl_again(item[key])
                else:
                    if isinstance(item[key], basestring) and uuid_regex.match(item[key]):
                        try:
                            item[key] = temp[item[key]]['value']
                        except:
                            pass

    crawl_again([report_info['source']['graph']])

    #return JSONResponse(report_info, indent=4)

    related_resource_dict = {
        'HERITAGE_RESOURCE': [],
        'HERITAGE_RESOURCE_GROUP': [],
        'ACTIVITY': [],
        'ACTOR': [],
        'HISTORICAL_EVENT': [],
        'INFORMATION_RESOURCE_IMAGE': [],
        'INFORMATION_RESOURCE_DOCUMENT': []
    }

    related_resource_info = get_related_resources(resourceid, lang)

    # parse the related entities into a dictionary by resource type
    for related_resource in related_resource_info['related_resources']:
        information_resource_type = 'DOCUMENT'
        related_resource['relationship'] = []
        if related_resource['entitytypeid'] == 'HERITAGE_RESOURCE.E18':
            for entity in related_resource['domains']:
                if entity['entitytypeid'] == 'RESOURCE_TYPE_CLASSIFICATION.E55':
                    related_resource['relationship'].append(get_preflabel_from_valueid(entity['value'], lang)['value'])
        elif related_resource['entitytypeid'] == 'HERITAGE_RESOURCE_GROUP.E27':
            for entity in related_resource['domains']:
                if entity['entitytypeid'] == 'RESOURCE_TYPE_CLASSIFICATION.E55':
                    related_resource['relationship'].append(get_preflabel_from_valueid(entity['value'], lang)['value'])
        elif related_resource['entitytypeid'] == 'ACTIVITY.E7':
            for entity in related_resource['domains']:
                if entity['entitytypeid'] == 'ACTIVITY_TYPE.E55':
                    related_resource['relationship'].append(get_preflabel_from_valueid(entity['value'], lang)['value'])
        elif related_resource['entitytypeid'] == 'ACTOR.E39':
            for entity in related_resource['domains']:
                if entity['entitytypeid'] == 'ACTOR_TYPE.E55':
                    related_resource['relationship'].append(get_preflabel_from_conceptid(entity['conceptid'], lang)['value'])
                    related_resource['actor_relationshiptype'] = ''
        elif related_resource['entitytypeid'] == 'HISTORICAL_EVENT.E5':
            for entity in related_resource['domains']:
                if entity['entitytypeid'] == 'HISTORICAL_EVENT_TYPE.E55':
                    related_resource['relationship'].append(get_preflabel_from_conceptid(entity['conceptid'], lang)['value'])
        elif related_resource['entitytypeid'] == 'INFORMATION_RESOURCE.E73':
            for entity in related_resource['domains']:
                if entity['entitytypeid'] == 'INFORMATION_RESOURCE_TYPE.E55':
                    related_resource['relationship'].append(get_preflabel_from_valueid(entity['value'], lang)['value'])
            for entity in related_resource['child_entities']:
                if entity['entitytypeid'] == 'FILE_PATH.E62':
                    related_resource['file_path'] = settings.MEDIA_URL + entity['label']
                if entity['entitytypeid'] == 'THUMBNAIL.E62':
                    related_resource['thumbnail'] = settings.MEDIA_URL + entity['label']
                    information_resource_type = 'IMAGE'

        # get the relationship between the two entities
        for relationship in related_resource_info['resource_relationships']:
            if relationship['entityid1'] == related_resource['entityid'] or relationship['entityid2'] == related_resource['entityid']: 
                related_resource['relationship'].append(get_preflabel_from_valueid(relationship['relationshiptype'], lang)['value'])

        entitytypeidkey = related_resource['entitytypeid'].split('.')[0]
        if entitytypeidkey == 'INFORMATION_RESOURCE':
            entitytypeidkey = '%s_%s' % (entitytypeidkey, information_resource_type)
        related_resource_dict[entitytypeidkey].append(related_resource)

    ## do some further sorting of the images information resources. categories are
    ## defined in settings.py, and images within these categories are sorted alphabetically
    img_list = list()
    for image_type in settings.RELATED_IMAGE_CATEGORIES:
        images = [i for i in related_resource_dict['INFORMATION_RESOURCE_IMAGE'] if\
            i['relationship'][0].lower() == image_type.lower()]

        s_images = sorted(images, key=lambda k: k['primaryname'])
        img_list += s_images

    ## catch any leftover images that haven't been classified as one of the three above
    leftovers = [i for i in related_resource_dict['INFORMATION_RESOURCE_IMAGE'] if not\
        i in img_list]
    s_leftovers = sorted(leftovers, key=lambda k: k['primaryname'])
    img_list += s_leftovers

    related_resource_dict['INFORMATION_RESOURCE_IMAGE'] = img_list

    # set boolean to trigger display of related resource graph
    related_resource_flag = False
    for k,v in related_resource_dict.iteritems():
        if len(v) > 0:
            related_resource_flag = True
            break
            
    if settings.DEBUG:
        related_dict_log_path = os.path.join(settings.PACKAGE_ROOT,'logs','current_related_resource_dict.log')
        with open(related_dict_log_path,"w") as log:
            print >> log, json.dumps(related_resource_dict, sort_keys=True,indent=2, separators=(',', ': '))
            
        related_info_log_path = os.path.join(settings.PACKAGE_ROOT,'logs','current_related_resource_info.log')
        with open(related_info_log_path,"w") as log:
            print >> log, json.dumps(related_resource_info, sort_keys=True,indent=2, separators=(',', ': '))
            
        graph_log_path = os.path.join(settings.PACKAGE_ROOT,'logs','current_graph.json')
        with open(graph_log_path,"w") as log:
            print >> log, json.dumps(report_info['source']['graph'], sort_keys=True,indent=2, separators=(',', ': '))

    centroid_coords = False
    try:
        src = se.search(index='maplayers', id=resourceid)['_source']
        centroid_coords = src['properties']['centroid']['coordinates']
    except:
        pass
    
    return render_to_response('resource-report.htm', {
            'geometry': JSONSerializer().serialize(report_info['source']['geometry']),
            'centroid_coords': centroid_coords,
            'resourceid': resourceid,
            'resource_type_name': settings.RESOURCE_TYPE_CONFIGS()[report_info['type']]['name'],
            'icon_class': settings.RESOURCE_TYPE_CONFIGS()[report_info['type']]['icon_class'],
            'report_template': 'views/reports/' + report_info['type'] + '.htm',
            'report_info': report_info,
            'related_resource_dict': related_resource_dict,
            'related_resource_flag': related_resource_flag,
            'main_script': 'resource-report',
            'active_page': 'ResourceReport',
            'primary_name_label': primary_label,
        },
        context_instance=RequestContext(request))        

def get_related_resources(resourceid, lang, limit=1000, start=0):
    ret = {
        'resource_relationships': [],
        'related_resources': []
    }
    se = SearchEngineFactory().create()

    query = Query(se, limit=limit, start=start)
    query.add_filter(Terms(field='entityid1', terms=resourceid).dsl, operator='or')
    query.add_filter(Terms(field='entityid2', terms=resourceid).dsl, operator='or')
    resource_relations = query.search(index='resource_relations', doc_type='all')
    ret['total'] = resource_relations['hits']['total']

    entityids = set()
    for relation in resource_relations['hits']['hits']:
        relation['_source']['preflabel'] = get_preflabel_from_valueid(relation['_source']['relationshiptype'], lang)
        ret['resource_relationships'].append(relation['_source'])
        entityids.add(relation['_source']['entityid1'])
        entityids.add(relation['_source']['entityid2'])
    if len(entityids) > 0:
        entityids.remove(resourceid)   

    related_resources = se.search(index='entity', doc_type='_all', id=list(entityids))
    if related_resources:
        for resource in related_resources['docs']:
            ret['related_resources'].append(resource['_source'])

    return ret