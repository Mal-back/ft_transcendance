import signal
import subprocess
import time

stopme = False

def sig_handler(sig, frame):
    stopme = True
#
signal.signal(signal.SIGTERM, sig_handler)
proc = subprocess.Popen(['gunicorn', '--bind', '0.0.0.0:8443', '--reload', '--certfile=/certs/django.crt',
                         '--keyfile=/certs/django.key', '--cert-reqs=2', '--ca-certs=/certs/nginx_client.crt',
                         '--do-handshake-on-connect', 'transcendance.wsgi'])
while (stopme == False) :
    pass
proc.terminate()
proc.wait()
print('Dumping Fixture')
proc = subprocess.Popen(['python3', 'manage.py', 'data/fixture.json'])
proc.wait()
