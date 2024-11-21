import signal
import subprocess
import time

stopme = False

def sig_handler(sig, frame):
    global stopme
    stopme = True

def process_manager():
    proc_list = []
    gUnit = subprocess.Popen(['gunicorn', '--bind', '0.0.0.0:8443', '--reload','auth.wsgi'])
    proc_list.append(gUnit)
    cron =  subprocess.Popen(['cron', '-f'])
    proc_list.append(cron)
    global stopme
    while (stopme == False) :
        time.sleep(1)

    for proc in proc_list:
        proc.terminate()
        proc.wait()

if __name__ == "__main__":
    signal.signal(signal.SIGTERM, sig_handler)
    signal.signal(signal.SIGINT, sig_handler)
    process_manager()
