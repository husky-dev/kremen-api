default: build

build:
	docker build -t ghcr.io/husky-dev/kremen-api/nginx:latest ./services/nginx
	docker build -t ghcr.io/husky-dev/kremen-api/transport-api:latest ./services/transport-api
	docker build -t ghcr.io/husky-dev/kremen-api/equipment-api:latest ./services/equipment-api
	docker build -t ghcr.io/husky-dev/kremen-api/cinemas-api:latest ./services/cinemas-api
	docker build -t ghcr.io/husky-dev/kremen-api/ws:latest ./services/ws
	docker build -t ghcr.io/husky-dev/kremen-api/backup:latest ./services/backup

push:
	docker push ghcr.io/husky-dev/kremen-api/nginx:latest
	docker push ghcr.io/husky-dev/kremen-api/transport-api:latest
	docker push ghcr.io/husky-dev/kremen-api/equipment-api:latest
	docker push ghcr.io/husky-dev/kremen-api/cinemas-api:latest
	docker push ghcr.io/husky-dev/kremen-api/ws:latest
	docker push ghcr.io/husky-dev/kremen-api/backup:latest

sync:
	rsync -aP ./common/services/ ./services/equipment-api
	rsync -aP ./common/services/ ./services/transport-api
	rsync -aP ./common/services/ ./services/cinemas-api
	rsync -aP ./common/services/ ./services/ws

lint:
	cd services/equipment-api && yarn lint:types
	cd services/transport-api && yarn lint:types
	cd services/cinemas-api && yarn lint:types
	cd services/ws && yarn lint:types
