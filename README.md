# ead
theban mapping project arches v3 app

### installation
assuming all v3 dependencies are installed, create and enter virtual environment.
2. pip install arches==3.1.2 and arches_hip==1.0.4
3. clone this repo and enter it
4. `pip install -r requirements`
5. setup elasticsearch and run `python manage.py packages -o setup_elasticsearch` followed by `ead/elasticsearch/elasticsearch-1.4.1/bin/elasticsearch -d`
6. install package `python manage.py packages -o install`
7. install gettext if necessary `sudo apt-get install gettext libgettextpo-dev`
8. compile translation messages `python manage.py compilemessages`
9. run dev server to view app `python manage.py runserver`

    
