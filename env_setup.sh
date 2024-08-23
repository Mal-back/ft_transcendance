#!/bin/bash

DJANGO_AUTH=./srcs/requirements/django_auth/certs
NGINX=./srcs/requirements/nginx/certs
PGSQL_AUTH=./srcs/requirements/postgreSQL_auth/certs
FRONTEND=./srcs/requirements/frontend/certs

openssl genrsa 4096 > ca.key
openssl req -new -x509 -nodes -days 365000 -key ca.key -out ca.crt -subj "/C=FR/ST=IDF/L=PARIS/O=42/OU=42/CN=CA/UID=vlevy"
# if [ ! $1 ]; then
# 	echo "This script should be call with the absolute path where env files are stored";
# 	exit 1;
# fi

mkdir -p $DJANGO_AUTH
mkdir -p $NGINX
mkdir -p $PGSQL_AUTH
mkdir -p $FRONTEND
openssl req -new -newkey rsa:4096 -nodes -out $DJANGO_AUTH/auth.csr -keyout $DJANGO_AUTH/auth.key -subj "/C=FR/ST=IDF/L=PARIS/O=42/OU=42/CN=auth/UID=vlevy" 
openssl x509 -req -days 365000 -in $DJANGO_AUTH/auth.csr -out $DJANGO_AUTH/auth.crt -CA ./ca.crt -CAkey ./ca.key
openssl req -new -newkey rsa:4096 -nodes -out $NGINX/nginx_client.csr -keyout $NGINX/nginx_client.key -subj "/C=FR/ST=IDF/L=PARIS/O=42/OU=42/CN=nginx_client/UID=vlevy" 
openssl x509 -req -days 365000 -in $NGINX/nginx_client.csr -out $NGINX/nginx_client.crt -CA ca.crt -CAkey ca.key
openssl req -new -newkey rsa:4096 -nodes -out $DJANGO_AUTH/auth_client.csr -keyout $DJANGO_AUTH/auth_client.key -subj "/C=FR/ST=IDF/L=PARIS/O=42/OU=42/CN=auth_client/UID=vlevy" 
openssl x509 -req -days 365000 -in $DJANGO_AUTH/auth_client.csr -out $DJANGO_AUTH/auth_client.crt -CA ca.crt -CAkey ca.key
openssl req -new -newkey rsa:4096 -nodes -out $PGSQL_AUTH/pgsql_auth.csr -keyout $PGSQL_AUTH/pgsql_auth.key -subj "/C=FR/ST=IDF/L=PARIS/O=42/OU=42/CN=pgsql/UID=vlevy" 
openssl x509 -req -days 365000 -in $PGSQL_AUTH/pgsql_auth.csr -out $PGSQL_AUTH/pgsql_auth.crt -CA ca.crt -CAkey ca.key
openssl req -new -newkey rsa:4096 -nodes -out $FRONTEND/frontend.csr -keyout $FRONTEND/frontend.key -subj "/C=FR/ST=IDF/L=PARIS/O=42/OU=42/CN=frontend/UID=vlevy" 
openssl x509 -req -days 365000 -in $FRONTEND/frontend.csr -out $FRONTEND/frontend.crt -CA ca.crt -CAkey ca.key

cp ./ca.crt $DJANGO_AUTH/ca.crt
cp ./ca.crt $NGINX/ca.crt
cp ./ca.crt $FRONTEND/ca.crt
cp ./ca.crt $PGSQL_AUTH/ca.crt
rm ./ca.crt ./ca.key
