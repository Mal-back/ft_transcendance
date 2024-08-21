#!/bin/bash

DJANGO=./srcs/requirements/django/certs/
NGINX=./srcs/requirements/nginx/certs/
PGSQL=./srcs/requirements/postgreSQL/certs/
FRONTEND=./srcs/requirements/frontend/certs/

if [ ! $1 ]; then
	echo "This script should be call with the absolute path where env files are stored";
	exit 1;
fi

mkdir -p $DJANGO
mkdir -p $NGINX
mkdir -p $PGSQL
mkdir -p $FRONTEND
openssl req -nodes -x509 -sha256 -out $DJANGO/django.crt -keyout $DJANGO/django.key -subj "/C=FR/ST=IDF/L=PARIS/O=42/OU=42/CN=django/UID=vlevy" 
openssl req -nodes -x509 -sha256 -out $NGINX/nginx_client.crt -keyout $NGINX/nginx_client.key -subj "/C=FR/ST=IDF/L=PARIS/O=42/OU=42/CN=nginx_client/UID=vlevy" 
openssl req -nodes -x509 -sha256 -out $DJANGO/django_client.crt -keyout $DJANGO/django_client.key -subj "/C=FR/ST=IDF/L=PARIS/O=42/OU=42/CN=django_client/UID=vlevy" 
openssl req -nodes -x509 -sha256 -out $PGSQL/pgsql.crt -keyout $PGSQL/pgsql.key -subj "/C=FR/ST=IDF/L=PARIS/O=42/OU=42/CN=pgsql/UID=vlevy" 
openssl req -nodes -x509 -sha256 -out $FRONTEND/frontend.crt -keyout $FRONTEND/frontend.key -subj "/C=FR/ST=IDF/L=PARIS/O=42/OU=42/CN=frontend/UID=vlevy" 
cp $DJANGO/django.crt $NGINX/django.crt
cp $NGINX/nginx_client.crt $DJANGO/nginx_client.crt
cp $NGINX/nginx_client.crt $FRONTEND/nginx_client.crt
cp $DJANGO/django_client.crt $PGSQL/django_client.crt
cp $PGSQL/pgsql.crt $DJANGO/pgsql.crt
cp $FRONTEND/frontend.crt $NGINX/frontend.crt
cp $1/env ./srcs/.env
# mkdir -p ./srcs/requirements/postgreSQL/certs/
# cp $1/django.crt ./srcs/requirements/nginx/certs/
# cp $1/django.crt $1/django.key ./srcs/requirements/django/certs/

