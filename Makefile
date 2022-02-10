build:
	docker build -t ghcr.io/husky-dev/kremen-api/nginx:latest ./services/nginx
	docker build -t ghcr.io/husky-dev/kremen-api/transport-ds:latest ./services/transport-ds
	docker build -t ghcr.io/husky-dev/kremen-api/equipment-ds:latest ./services/equipment-ds
	docker build -t ghcr.io/husky-dev/kremen-api/cinemas-ds:latest ./services/cinemas-ds
	# docker build -t ghcr.io/husky-dev/kremen-api/cinemas-api:latest ./services/cinemas-api
	# docker build -t ghcr.io/husky-dev/kremen-api/watchman:latest ./services/watchman
	docker build -t ghcr.io/husky-dev/kremen-api/backup:latest ./services/backup

push:
	docker push ghcr.io/husky-dev/kremen-api/nginx:latest
	docker push ghcr.io/husky-dev/kremen-api/transport-ds:latest
	docker push ghcr.io/husky-dev/kremen-api/equipment-ds:latest
	docker push ghcr.io/husky-dev/kremen-api/cinemas-ds:latest
	# docker push ghcr.io/husky-dev/kremen-api/cinemas-api:latest
	# docker push ghcr.io/husky-dev/kremen-api/watchman:latest
	docker push ghcr.io/husky-dev/kremen-api/backup:latest

sync:
	rsync -aP ./common/ ./services/equipment-ds/src
	rsync -aP ./common/ ./services/transport-ds/src
	rsync -aP ./common/ ./services/cinemas-ds/src
