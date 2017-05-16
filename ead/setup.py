import os
import arches_hip.setup as setup
from arches.app.models.models import DLanguages
from management import authority_files_utils
from django.conf import settings

def install(path_to_source_data_dir=None):
    setup.install()
    add_arabic()
    load_authority_files(os.path.join(settings.PACKAGE_ROOT, 'source_data', 'concepts', 'authority_files'))
    

def load_resource_graphs():
    setup.resource_graphs.load_graphs(break_on_error=True)

def load_authority_files(path_to_files=None):
    authority_files_utils.load_authority_files(path_to_files,break_on_error=True)

def load_resources(external_file=None):
    setup.load_resources(external_file)

def add_arabic():
    print "Arabic added as language option"
    ar = DLanguages(languageid="ar",languagename="ARABIC",isdefault=False)
    ar.save()
