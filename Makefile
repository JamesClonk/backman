.PHONY: run gin build prepare-test test mysql mysql-network mysql-stop mysql-start mysql-client postgres postgres-network postgres-stop postgres-start postgres-client mongodb mongodb-network mongodb-stop mongodb-start mongodb-client cleanup
SHELL := /bin/bash

all: run

run:
	go run main.go

gin:
	gin --all --immediate run main.go

build:
	rm -f appcloud-backman-app
	go build -o appcloud-backman-app

prepare-test:
	mkdir -p $$GOPATH/src/gitlab.swisscloud.io/appcloud-backman-app|| true
	ln -s $$(pwd) $$GOPATH/src/gitlab.swisscloud.io/appc-cf-core/appcloud-backman-app

test:
	cd $$GOPATH/src/gitlab.swisscloud.io/appc-cf-core/appcloud-backman-app && source .env && GOARCH=amd64 GOOS=linux go test $$(go list ./... | grep -v /vendor/)

mysql: mysql-network mysql-stop mysql-start
	docker logs mysql -f

mysql-network:
	docker network create mysql-network --driver bridge || true

mysql-stop:
	docker rm -f mysql || true

mysql-start:
	docker run -d -p 3306:3306 \
		-e MYSQL_ROOT_PASSWORD='my-secret-pw' \
		--network mysql-network \
		--name mysql mysql

mysql-client:
	docker run -it --rm \
		-e MYSQL_PWD='my-secret-pw' \
		--network mysql-network \
		--name mysql-client mysql mysql -hmysql -uroot

postgres: postgres-network postgres-stop postgres-start
	docker logs postgres -f

postgres-network:
	docker network create postgres-network --driver bridge || true

postgres-stop:
	docker rm -f postgres || true

postgres-start:
	docker run --name postgres \
	    --network postgres-network \
		-e POSTGRES_USER='dev-user' \
		-e POSTGRES_PASSWORD='dev-secret' \
		-e POSTGRES_DB='my_postgres_db' \
		-p 5432:5432 \
		-d postgres:9-alpine

postgres-client:
	docker exec -it \
		-e PGPASSWORD='dev-secret' \
		postgres psql -U 'dev-user' -d 'my_postgres_db'

mongodb: mongodb-network mongodb-stop mongodb-start
	docker logs mongodb -f

mongodb-network:
	docker network create mongodb-network --driver bridge || true

mongodb-stop:
	docker rm -f mongodb || true

mongodb-start:
	docker run --name mongodb \
		--network mongodb-network \
		-e MONGO_INITDB_ROOT_USERNAME='mongoadmin' \
		-e MONGO_INITDB_ROOT_PASSWORD='super-secret' \
		-p 27017:27017 \
		-d mongo:3.6

mongodb-client:
	docker run -it --rm \
		--network mongodb-network \
		--name mongodb-client mongo:3.6 mongo \
			--host mongodb \
        	-u 'mongoadmin' \
        	-p 'super-secret' \
        	--authenticationDatabase admin

cleanup:
	docker system prune --volumes -a
