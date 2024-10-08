FILE='./srcs/docker-compose.yml'

all : compose env
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

down :
	docker compose -f ./srcs/docker-compose.yml down

re : down all

clean :
	docker stop $$(docker ps -qa);\
	docker rm $$(docker ps -qa);\
	docker rmi -f $$(docker images -qa);\
	docker volume rm $$(docker volume ls -q);\

.Phony : all down clean env compose
