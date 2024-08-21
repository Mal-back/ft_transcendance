FILE='./srcs/docker-compose.yml'

all :
	@if [ ! -f ${FILE} ]; then\
		cp ${FILE}.template ${FILE};\
		sed -i "s|placeholder|${PWD}|g" ${FILE};\
	fi

	@if [ ! -f ./srcs/.env ] || [ ! -d ./srcs/requirements/nginx/certs ] || [ ! -d ./srcs/requirements/django/certs/ ] ; then \
		echo "Could not find necessary files that are kept out of version control.Did you run env_setup.sh ?";\
		false;\
	fi
	docker compose -f ./srcs/docker-compose.yml up -d --build

down :
	docker compose -f ./srcs/docker-compose.yml down

clean :
	docker stop $$(docker ps -qa);\
	docker rm $$(docker ps -qa);\
	docker rmi -f $$(docker images -qa);\

.Phony : all down clean
