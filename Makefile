default: build

build: FORCE
	docker-compose -f docker-compose.build.yml build

push: FORCE
	docker-compose -f docker-compose.build.yml push

FORCE: ;