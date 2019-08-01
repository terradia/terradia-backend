stop:
	docker stop $(shell docker ps -aq)

rm-all:
	docker rm $(shell docker ps -aq)

rm-all-images:
	docker rmi -f $(shell docker images -q)

nuke:
	make stop && make rm-all && make rm-all-images

up:
	docker-compose -p terradia up

down:
	docker-compose down

build:
	docker-compose -p terradia up --build

rebuild:
	make down && make build

enter-api:
	docker exec -it terradia_api_1 /bin/bash