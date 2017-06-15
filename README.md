# Egyptian Archaeological Database
Arches v3 app in development by the Theban Mapping Project, at the American University in Cairo. Until the official EAD is released, you can view a demo version of this app at arches3.legiongis.com/ead. Feel free to login with `admin` for both user name and password. No resource data will be retained in this demo installation.

### features
+ Arabic translation, added rosetta plugin to facilitate translation
+ Modified Authority Document loader and format to allow initial load of Arabic labels for concepts
+ Decimal Degrees user input in Location form.
+ Degrees Minutes Seconds displayed in map popups.
+ Report print button added and print formatting improved
+ Improved primary name function for display

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

