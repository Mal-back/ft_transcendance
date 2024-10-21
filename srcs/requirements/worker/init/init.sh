#!/bin/bash

export DJANGO_SETTINGS_MODULE=game.settings
pip install --upgrade pip --no-input
pip install -r /init/requirements.txt --no-input
if [ $LOAD_DATA == "True" ] ; then
	python3 manage.py loaddata data/fixture.json
fi
if ["$DUMP_DATA" == "True" ] ; then
	exec python3 gunicornWrapper.py
else
	exec python3 manage.py runworker local_engine -v2
fi