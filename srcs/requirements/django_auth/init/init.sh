/bin/bash

pip install --upgrade pip --no-input
pip install -r /init/requirements.txt --no-input
python3 manage.py makemigrations --noinput
python3 manage.py migrate --noinput
python3 manage.py collectstatic --noinput
if [ $LOAD_DATA == "True" ]; then
	python3 manage.py loaddata data/fixture.json
fi
if [ "$DUMP_DATA" == "True" ]; then
	exec python3 gunicornWrapper.py
else
	exec gunicorn --bind 0.0.0.0:8443 ${HOT_RELOAD} --certfile=/certs/auth.crt \
		--keyfile=/certs/auth.key --cert-reqs=2 \
		--ca-certs=/certs/nginx_client.crt \
		--do-handshake-on-connect auth.wsgi
fi