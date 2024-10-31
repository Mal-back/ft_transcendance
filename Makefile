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
	docker compose -f ./srcs/docker-compose.yml down -t 10

re : down all

migration:
	rm srcs/volumes/matchmaking/matchmaking_app/migrations/000*
	rm srcs/volumes/auth/auth_app/migrations/000*
	rm srcs/volumes/auth/auth_app/migrations/000*
	rm srcs/volumes/game/game_app/migrations/000*
	rm srcs/volumes/avatar_management/avatar_management_app/migrations/000*
	rm srcs/volumes/uses/avatar_management_app/migrations/000*
	rm srcs/volumes/users/users_app/migrations/000*

clean :
	docker stop $$(docker ps -qa);\
	docker rm $$(docker ps -qa);\
	docker rmi -f $$(docker images -qa);\
	docker volume rm $$(docker volume ls -q);\


.Phony : all down clean env compose
