import arches_hip.setup as setup
from arches.app.models.models import DLanguages

def install(path_to_source_data_dir=None):
    setup.install()
    add_arabic()

def load_resource_graphs():
    setup.resource_graphs.load_graphs(break_on_error=True)

def load_authority_files(path_to_files=None):
    setup.authority_files.load_authority_files(path_to_files, break_on_error=True)

def load_resources(external_file=None):
    setup.load_resources(external_file)

def add_arabic():
    print "Arabic added as language option"
    ar = DLanguages(languageid="ar",languagename="ARABIC",isdefault=False)
    ar.save()
