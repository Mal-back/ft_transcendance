#! /bin/bash
if [ ! -d ./djangoEnv ]; then
		python3 -m venv djangoEnv
fi
source ./djangoEnv/bin/activate
pip3 install --upgrade pip
pip3 install -r requirements.txt
