default: build

build:
	docker build -t ghcr.io/husky-dev/kremen-api/transport-api:latest ./services/transport-api
	# docker build -t ghcr.io/husky-dev/kremen-api/equipment-api:latest ./services/equipment-api
	# docker build -t ghcr.io/husky-dev/kremen-api/ws:latest ./services/ws
	# docker build -t ghcr.io/husky-dev/kremen-api/img:latest ./services/img
	docker build -t ghcr.io/husky-dev/kremen-api/nginx:latest ./services/nginx

push:
	docker push ghcr.io/husky-dev/kremen-api/nginx:latest
	docker push ghcr.io/husky-dev/kremen-api/transport-api:latest
	# docker push ghcr.io/husky-dev/kremen-api/equipment-api:latest
	# docker push ghcr.io/husky-dev/kremen-api/ws:latest
	# docker push ghcr.io/husky-dev/kremen-api/img:latest

pull:
	docker pull ghcr.io/husky-dev/kremen-api/nginx:latest
	docker pull ghcr.io/husky-dev/kremen-api/transport-api:latest
	# docker pull ghcr.io/husky-dev/kremen-api/equipment-api:latest
	# docker pull ghcr.io/husky-dev/kremen-api/ws:latest
	# docker pull ghcr.io/husky-dev/kremen-api/img:latest

lint:
	cd services/equipment-api && yarn lint:types
	cd services/transport-api && yarn lint:types
	cd services/ws && yarn lint:types
	cd services/img && yarn lint:types
