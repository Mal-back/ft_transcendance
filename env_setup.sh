#!/bin/bash

# generating certs for ssl communication between microservice

DJANGO_AUTH=./srcs/requirements/django_auth/certs
DJANGO_USERS=./srcs/requirements/django_users/certs
DJANGO_GAME=./srcs/requirements/django_game/certs
WORKER=./srcs/requirements/worker/certs
DJANGO_MATCHMAKING=./srcs/requirements/django_matchmaking/certs/

DJANGO_AVATAR=./srcs/requirements/django_media/certs/
DJANGO_HISTORY=./srcs/requirements/django_history/certs/
NGINX=./srcs/requirements/nginx/certs

PGSQL_AUTH=./srcs/requirements/postgreSQL_auth/certs
PGSQL_USERS=./srcs/requirements/postgreSQL_users/certs
PGSQL_GAME=./srcs/requirements/postgreSQL_game/certs
PGSQL_MATCHMAKING=./srcs/requirements/postgreSQL_matchmaking/certs

PGSQL_AVATAR=./srcs/requirements/postgreSQL_avatar/certs/
PGSQL_HISTORY=./srcs/requirements/postgreSQL_history/certs/
FRONTEND=./srcs/requirements/frontend/certs
GEN_CSR="openssl req -new -newkey rsa:4096 -nodes -out"
GEN_CRT="openssl x509 -req -days 365000 -in"

openssl genrsa 4096 > ca.key
openssl req -new -x509 -nodes -days 365000 -key ca.key -out ca.crt -subj "/C=FR/ST=IDF/L=PARIS/O=42/OU=42/CN=CA/UID=vlevy"
# if [ ! $1 ]; then
# 	echo "This script should be call with the absolute path where env files are stored";
# 	exit 1;
# fi

mkdir -p $DJANGO_AUTH
mkdir -p $DJANGO_USERS
mkdir -p $DJANGO_GAME
mkdir -p $DJANGO_MATCHMAKING
mkdir -p $DJANGO_AVATAR
mkdir -p $DJANGO_HISTORY
mkdir -p $NGINX
mkdir -p $PGSQL_AUTH
mkdir -p $FRONTEND
mkdir -p $PGSQL_USERS
mkdir -p $PGSQL_GAME
mkdir -p $PGSQL_MATCHMAKING
mkdir -p $PGSQL_AVATAR
mkdir -p $PGSQL_HISTORY
mkdir -p $WORKER

$GEN_CSR $NGINX/nginx_client.csr -keyout $NGINX/nginx_client.key -subj "/C=FR/ST=IDF/L=PARIS/O=42/OU=42/CN=nginx_client/UID=vlevy" 
$GEN_CRT $NGINX/nginx_client.csr -out $NGINX/nginx_client.crt -CA ca.crt -CAkey ca.key

$GEN_CSR $NGINX/nginx.csr -keyout $NGINX/nginx.key -subj "/C=FR/ST=IDF/L=PARIS/O=42/OU=42/CN=nginx/UID=vlevy" 
$GEN_CRT $NGINX/nginx.csr -out $NGINX/nginx.crt -CA ca.crt -CAkey ca.key

$GEN_CSR $DJANGO_AUTH/auth.csr -keyout $DJANGO_AUTH/auth.key -subj "/C=FR/ST=IDF/L=PARIS/O=42/OU=42/CN=auth/UID=vlevy" 
$GEN_CRT $DJANGO_AUTH/auth.csr -out $DJANGO_AUTH/auth.crt -CA ./ca.crt -CAkey ./ca.key

$GEN_CSR $DJANGO_AUTH/auth_client.csr -keyout $DJANGO_AUTH/auth_client.key -subj "/C=FR/ST=IDF/L=PARIS/O=42/OU=42/CN=auth_client/UID=vlevy" 
$GEN_CRT $DJANGO_AUTH/auth_client.csr -out $DJANGO_AUTH/auth_client.crt -CA ca.crt -CAkey ca.key

$GEN_CSR $PGSQL_AUTH/pgsql_auth.csr -keyout $PGSQL_AUTH/pgsql_auth.key -subj "/C=FR/ST=IDF/L=PARIS/O=42/OU=42/CN=pgsql/UID=vlevy" 
$GEN_CRT $PGSQL_AUTH/pgsql_auth.csr -out $PGSQL_AUTH/pgsql_auth.crt -CA ca.crt -CAkey ca.key

$GEN_CSR $FRONTEND/frontend.csr -keyout $FRONTEND/frontend.key -subj "/C=FR/ST=IDF/L=PARIS/O=42/OU=42/CN=frontend/UID=vlevy" 
$GEN_CRT $FRONTEND/frontend.csr -out $FRONTEND/frontend.crt -CA ca.crt -CAkey ca.key

$GEN_CSR $DJANGO_USERS/users.csr -keyout $DJANGO_USERS/users.key -subj "/C=FR/ST=IDF/L=PARIS/O=42/OU=42/CN=users/UID=vlevy" 
$GEN_CRT $DJANGO_USERS/users.csr -out $DJANGO_USERS/users.crt -CA ./ca.crt -CAkey ./ca.key

$GEN_CSR $DJANGO_USERS/users_client.csr -keyout $DJANGO_USERS/users_client.key -subj "/C=FR/ST=IDF/L=PARIS/O=42/OU=42/CN=users_client/UID=vlevy" 
$GEN_CRT $DJANGO_USERS/users_client.csr -out $DJANGO_USERS/users_client.crt -CA ca.crt -CAkey ca.key

$GEN_CSR $PGSQL_USERS/pgsql_users.csr -keyout $PGSQL_USERS/pgsql_users.key -subj "/C=FR/ST=IDF/L=PARIS/O=42/OU=42/CN=pgsql/UID=vlevy" 
$GEN_CRT $PGSQL_USERS/pgsql_users.csr -out $PGSQL_USERS/pgsql_users.crt -CA ca.crt -CAkey ca.key

$GEN_CSR $DJANGO_GAME/game.csr -keyout $DJANGO_GAME/game.key -subj "/C=FR/ST=IDF/L=PARIS/O=42/OU=42/CN=game/UID=vlevy" 
$GEN_CRT $DJANGO_GAME/game.csr -out $DJANGO_GAME/game.crt -CA ./ca.crt -CAkey ./ca.key

$GEN_CSR $DJANGO_GAME/game_client.csr -keyout $DJANGO_GAME/game_client.key -subj "/C=FR/ST=IDF/L=PARIS/O=42/OU=42/CN=game_client/UID=vlevy"
$GEN_CRT $DJANGO_GAME/game_client.csr -out $DJANGO_GAME/game_client.crt -CA ca.crt -CAkey ca.key

$GEN_CSR $PGSQL_GAME/pgsql_game.csr -keyout $PGSQL_GAME/pgsql_game.key -subj "/C=FR/ST=IDF/L=PARIS/O=42/OU=42/CN=pgsql/UID=vlevy" 
$GEN_CRT $PGSQL_GAME/pgsql_game.csr -out $PGSQL_GAME/pgsql_game.crt -CA ca.crt -CAkey ca.key

$GEN_CSR $DJANGO_MATCHMAKING/matchmaking.csr -keyout $DJANGO_MATCHMAKING/matchmaking.key -subj "/C=FR/ST=IDF/L=PARIS/O=42/OU=42/CN=matchmaking/UID=vlevy" 
$GEN_CRT $DJANGO_MATCHMAKING/matchmaking.csr -out $DJANGO_MATCHMAKING/matchmaking.crt -CA ./ca.crt -CAkey ./ca.key

$GEN_CSR $DJANGO_MATCHMAKING/matchmaking_client.csr -keyout $DJANGO_MATCHMAKING/matchmaking_client.key -subj "/C=FR/ST=IDF/L=PARIS/O=42/OU=42/CN=matchmaking_client/UID=vlevy" 
$GEN_CRT $DJANGO_MATCHMAKING/matchmaking_client.csr -out $DJANGO_MATCHMAKING/matchmaking_client.crt -CA ca.crt -CAkey ca.key

$GEN_CSR $PGSQL_MATCHMAKING/pgsql_matchmaking.csr -keyout $PGSQL_MATCHMAKING/pgsql_matchmaking.key -subj "/C=FR/ST=IDF/L=PARIS/O=42/OU=42/CN=pgsql/UID=vlevy" 
$GEN_CRT $PGSQL_MATCHMAKING/pgsql_matchmaking.csr -out $PGSQL_MATCHMAKING/pgsql_matchmaking.crt -CA ca.crt -CAkey ca.key

$GEN_CSR $DJANGO_AVATAR/avatar.csr -keyout $DJANGO_AVATAR/avatar.key -subj "/C=FR/ST=IDF/L=PARIS/O=42/OU=42/CN=avatars/UID=vlevy" 
$GEN_CRT $DJANGO_AVATAR/avatar.csr -out $DJANGO_AVATAR/avatar.crt -CA ./ca.crt -CAkey ./ca.key

$GEN_CSR $PGSQL_AVATAR/pgsql_avatar.csr -keyout $PGSQL_AVATAR/pgsql_avatar.key -subj "/C=FR/ST=IDF/L=PARIS/O=42/OU=42/CN=pgsql/UID=vlevy" 
$GEN_CRT $PGSQL_AVATAR/pgsql_avatar.csr -out $PGSQL_AVATAR/pgsql_avatar.crt -CA ca.crt -CAkey ca.key

$GEN_CSR "$DJANGO_HISTORY/history.csr" -keyout "$DJANGO_HISTORY/history.key" -subj "/C=FR/ST=IDF/L=PARIS/O=42/OU=42/CN=historys/UID=vlevy" 
$GEN_CRT "$DJANGO_HISTORY/history.csr" -out "$DJANGO_HISTORY/history.crt" -CA ./ca.crt -CAkey ./ca.key

$GEN_CSR $PGSQL_HISTORY/pgsql_history.csr -keyout $PGSQL_HISTORY/pgsql_history.key -subj "/C=FR/ST=IDF/L=PARIS/O=42/OU=42/CN=pgsql/UID=vlevy" 
$GEN_CRT $PGSQL_HISTORY/pgsql_history.csr -out $PGSQL_HISTORY/pgsql_history.crt -CA ca.crt -CAkey ca.key

cp ./ca.crt $DJANGO_AUTH/ca.crt
cp ./ca.crt $DJANGO_GAME/ca.crt
cp ./ca.crt $NGINX/ca.crt
cp ./ca.crt $FRONTEND/ca.crt
cp ./ca.crt $PGSQL_AUTH/ca.crt
cp ./ca.crt $PGSQL_USERS/ca.crt
cp ./ca.crt $PGSQL_GAME/ca.crt
cp ./ca.crt $DJANGO_USERS/ca.crt
cp ./ca.crt $PGSQL_MATCHMAKING/ca.crt
cp ./ca.crt $DJANGO_MATCHMAKING/ca.crt
cp ./ca.crt $DJANGO_AVATAR/ca.crt
cp ./ca.crt $PGSQL_AVATAR/ca.crt
cp ./ca.crt $DJANGO_HISTORY/ca.crt
cp ./ca.crt $PGSQL_HISTORY/ca.crt
# cp ./ca.crt $WORKER/ca.crt

cp $DJANGO_GAME/* $WORKER

rm ./ca.crt ./ca.key

# generating JWT key pair
openssl genpkey -algorithm RSA -out $DJANGO_AUTH/jwt_private.pem -pkeyopt rsa_keygen_bits:4096
openssl rsa -pubout -in $DJANGO_AUTH/jwt_private.pem -out $DJANGO_AUTH/jwt_public.pem
cp $DJANGO_AUTH/jwt_public.pem $DJANGO_USERS/jwt_public.pem
cp $DJANGO_AUTH/jwt_public.pem $DJANGO_GAME/jwt_public.pem
cp $DJANGO_AUTH/jwt_public.pem $WORKER/jwt_public.pem
cp $DJANGO_AUTH/jwt_public.pem $DJANGO_MATCHMAKING/jwt_public.pem
cp $DJANGO_AUTH/jwt_public.pem $DJANGO_AVATAR/jwt_public.pem
cp $DJANGO_AUTH/jwt_public.pem $DJANGO_HISTORY/jwt_public.pem
