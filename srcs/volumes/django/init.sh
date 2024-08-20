/bin/bash

pip install --upgrade pip --no-input
pip install -r requirements.txt --no-input
python manage.py makemigrations --noinput
python manage.py migrate --noinput
python manage.py collectstatic --noinput
exec gunicorn --bind 0.0.0.0:8443 ${HOT_RELOAD} --certfile=/certs/django.crt --keyfile=/certs/django.key transcendance.wsgi
