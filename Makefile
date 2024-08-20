all :
	@bash setup_user.sh
	docker compose -f ./srcs/docker-compose.yml up -d --build

down :
	docker compose -f ./srcs/docker-compose.yml down

clean :
	docker stop $$(docker ps -qa);\
	docker rm $$(docker ps -qa);\
	docker rmi -f $$(docker images -qa);\

.Phony : all down clean
