FILE='./srcs/docker-compose.yml'


all : compose env update-hostname
	docker compose -f ./srcs/docker-compose.yml up -d --build

compose :
	@if [ ! -f ${FILE} ]; then\
		cp ${FILE}.template ${FILE};\
		sed -i "s|placeholder|${PWD}|g" ${FILE};\
	fi

env :
	@if [ ! -f ./srcs/.env ]; then \
		echo "Could not find necessary files that are kept out of version control. Did you run env_setup.sh ?";\
		false;\
	fi



update-hostname:
	@# Get the hostname
	@HOSTNAME_VALUE=$(shell hostname); \
	ENV_FILE="srcs/.env"; \
	if sed -n '3p' $$ENV_FILE | grep -q "^HOSTNAME="; then \
	    sed -i "3s|^HOSTNAME=.*|HOSTNAME=$$HOSTNAME_VALUE|" $$ENV_FILE; \
	else \
	    sed -i "3i HOSTNAME=$$HOSTNAME_VALUE" $$ENV_FILE; \
	fi


down :
	docker compose -f ./srcs/docker-compose.yml down -t 10

re : down all

clean :
	docker stop $$(docker ps -qa);\
	docker rm $$(docker ps -qa);\
	docker rmi -f $$(docker images -qa);\
	docker volume rm $$(docker volume ls -q);\

.Phony : all down clean env compose
