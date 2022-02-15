build:
	docker build -t ghcr.io/husky-dev/kremen-api/nginx:latest ./services/nginx
	docker build -t ghcr.io/husky-dev/kremen-api/transport-api:latest ./services/transport-api
	docker build -t ghcr.io/husky-dev/kremen-api/equipment-api:latest ./services/equipment-api
	docker build -t ghcr.io/husky-dev/kremen-api/cinemas-api:latest ./services/cinemas-api
	docker build -t ghcr.io/husky-dev/kremen-api/watchman:latest ./services/watchman
	docker build -t ghcr.io/husky-dev/kremen-api/backup:latest ./services/backup

push:
	docker push ghcr.io/husky-dev/kremen-api/nginx:latest
	docker push ghcr.io/husky-dev/kremen-api/transport-api:latest
	docker push ghcr.io/husky-dev/kremen-api/equipment-api:latest
	docker push ghcr.io/husky-dev/kremen-api/cinemas-api:latest
	docker push ghcr.io/husky-dev/kremen-api/watchman:latest
	docker push ghcr.io/husky-dev/kremen-api/backup:latest

sync:
	rsync -aP ./common/ ./services/equipment-api
	rsync -aP ./common/ ./services/transport-api
	rsync -aP ./common/ ./services/cinemas-api
	rsync -aP ./common/ ./services/watchman

lint:
	cd services/equipment-api && yarn lint:types
	cd services/transport-api && yarn lint:types
	cd services/cinemas-api && yarn lint:types
	cd services/watchman && yarn lint:types
