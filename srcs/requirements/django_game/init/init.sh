#!/bin/bash

export DJANGO_SETTINGS_MODULE=game.settings
pip install --upgrade pip --no-input
pip install -r /init/requirements.txt --no-input
python3 manage.py makemigrations --noinput
python3 manage.py migrate --noinput
python3 manage.py collectstatic --noinput
if [ $LOAD_DATA == "True" ] ; then
	python3 manage.py loaddata data/fixture.json
fi
if ["$DUMP_DATA" == "True" ] ; then
	exec python3 gunicornWrapper.py
else
	python3 manage.py flush --noinput
	exec daphne -b '0.0.0.0' -p '8443' --ping-timeout 15 game.asgi:application
fi