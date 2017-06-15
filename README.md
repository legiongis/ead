# ead
theban mapping project arches v3 app

### installation
assuming all v3 dependencies are installed, create and enter virtual environment. then

1. pip install arches==3.1.2 and arches_hip==1.0.4
2. clone this repo and enter it
3. `pip install -r requirements`
4. setup elasticsearch and run `python manage.py packages -o setup_elasticsearch` followed by `ead/elasticsearch/elasticsearch-1.4.1/bin/elasticsearch -d`
5. install package `python manage.py packages -o install`
6. install gettext if necessary `sudo apt-get install gettext libgettextpo-dev`
7. compile translation messages `python manage.py compilemessages`
8. run dev server to view app `python manage.py runserver`

    
