/bin/bash

pip install --upgrade pip --no-input
pip install -r requirements.txt --no-input
python3 manage.py makemigrations --noinput
python3 manage.py migrate --noinput
python3 manage.py collectstatic --noinput
if [[ ! -z $DUMP_DATA ]]; then
	exec gunicorn --bind 0.0.0.0:8443 ${HOT_RELOAD} --certfile=/certs/django.crt \
								--keyfile=/certs/django.key --cert-reqs=2 \
								--ca-certs=/certs/nginx_client.crt \
								--do-handshake-on-connect transcendance.wsgi
else
	exec python3 gunicornWrapper.py
fi
