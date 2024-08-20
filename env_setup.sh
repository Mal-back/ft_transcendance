#!/bin/bash

if [ ! $1 ]; then
	echo "This script should be call with the absolute path where env files are stored";
	exit 1;
fi

cp $1/.env ./srcs/
mkdir -p ./srcs/requirements/nginx/certs/
mkdir -p ./srcs/requirements/django/certs/
cp $1/django.crt ./srcs/requirements/nginx/certs/
cp $1/django.crt $1/django.key ./srcs/requirements/django/certs/

