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

from arches_hip import urls as arches_hip_urls
from django.conf import settings
from django.conf.urls import patterns, url, include

uuid_regex = '[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}'

urlpatterns = patterns('',
    
    url(r'^resources/(?P<resourcetypeid>[0-9a-zA-Z_.]*)/(?P<form_id>[a-zA-Z_-]*)/(?P<resourceid>%s|())$' % uuid_regex, 'ead.views.resources.resource_manager', name="resource_manager"),
    url(r'^rdm/(?P<conceptid>%s|())$' % uuid_regex , 'ead.views.concept.rdm', name='rdm'),
    url(r'^concepts/(?P<conceptid>%s|())$' % uuid_regex , 'ead.views.concept.concept', name="concept"),
    url(r'^reports/(?P<resourceid>%s)$' % uuid_regex , 'ead.views.resources.report', name='report'),
    url(r'', include(arches_hip_urls)),
    # url(r'^admin/doc/', include('django.contrib.admindocs.urls')),
    url(r'^i18n/', include('django.conf.urls.i18n')),
    url(r'^rosetta/', include('rosetta.urls')),
    url(r'^search$', 'ead.views.search.home_page', name="search_home"),
    url(r'^search/terms$', 'ead.views.search.search_terms', name="search_terms"),
    url(r'^search/resources$', 'ead.views.search.search_results', name="search_results"),
    url(r'^search/export$', 'ead.views.search.export_results', name="search_results_export"),
    url(r'^geocoder', 'ead.views.search.geocode', name="geocoder"),
    url(r'^buffer/$', 'ead.views.search.buffer', name="buffer"),
)

# if 'rosetta' in settings.INSTALLED_APPS:
    # urlpatterns += patterns('',
        # url(r'^rosetta/', include('rosetta.urls')),
    # )
