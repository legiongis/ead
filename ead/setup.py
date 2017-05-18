import os
import arches_hip.setup as setup
from arches.app.models.models import DLanguages
from django.contrib.auth.models import Group, User
from management import authority_files_utils
from django.conf import settings

def install(path_to_source_data_dir=None):
    setup.install()
    add_ead_permissions()
    add_arabic()
    load_authority_files(os.path.normpath(os.path.join(settings.PACKAGE_ROOT, 'source_data', 'concepts', 'authority_files')))
    

def load_resource_graphs():
    setup.resource_graphs.load_graphs(break_on_error=True)

def load_authority_files(path_to_files=None):
    authority_files_utils.load_authority_files(path_to_files)

def load_resources(external_file=None):
    setup.load_resources(external_file)

def add_arabic():
    print "Arabic added as language option"
    ar = DLanguages(languageid="ar",languagename="ARABIC",isdefault=False)
    ar.save()
    
def add_ead_permissions():
    '''these are in addition to the default admin permissions added by arches,
    this is not a standalone function'''
    
    rdm_group = Group(name='rdm')
    rdm_group.save()
    
    admin = User.objects.get_or_create(username='admin')[0]
    admin.groups.add(rdm_group)
    
    edit_group = Group.objects.get_or_create(name='edit')[0]
    editor = User.objects.create_user('editor','','editor')
    editor.groups.add(edit_group)
    
