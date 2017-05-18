import os
import arches_hip.setup as setup
from arches.app.models.models import DLanguages
from django.contrib.auth.models import Group, User, Permission, ContentType
from management import authority_files_utils
from django.conf import settings

def install(path_to_source_data_dir=None):
    setup.install()
    build_auth_system()
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
    
def build_auth_system():
    '''create new auth system for EAD'''
    
    print "\nREMOVING ARCHES-HIP PERMISSIONS & GROUPS\n-----------------------"
    all_perms = Permission.objects.filter()
    for p in all_perms:
        p.delete()
    print "  {} permissions removed".format(len(all_perms))
    
    all_groups = Group.objects.filter()
    for g in all_groups:
        g.delete()
    print "  {} groups removed".format(len(all_groups))
    
    e_content_type = ContentType.objects.get_or_create(app_label='ead', model='edit')
    edit_perm = Permission.objects.create(codename='edit', name='edit', content_type=e_content_type[0])
    
    r_content_type = ContentType.objects.get_or_create(app_label='ead', model='rdm')
    rdm_perm = Permission.objects.create(codename='rdm', name='rdm', content_type=r_content_type[0])
    
    admin = User.objects.get_or_create(username='admin')[0]
    admin.user_permissions.add(rdm_perm)
    admin.user_permissions.add(edit_perm)

    editor = User.objects.create_user('editor','','editor')
    editor.user_permissions.add(edit_perm)
    
