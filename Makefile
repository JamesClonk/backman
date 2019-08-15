.PHONY: run build prepare-test test mysql mysql-network mysql-stop mysql-start mysql-client
SHELL := /bin/bash

all: run

run:
	go run main.go

build:
	rm -f appcloud-backman-app
	go build -o appcloud-backman-app

prepare-test:
	mkdir -p $$GOPATH/src/gitlab.swisscloud.io/appcloud-backman-app|| true
	ln -s $$(pwd) $$GOPATH/src/gitlab.swisscloud.io/appc-cf-core/appcloud-backman-app

test:
	cd $$GOPATH/src/gitlab.swisscloud.io/appc-cf-core/appcloud-backman-app && GOARCH=amd64 GOOS=linux go test $$(go list ./... | grep -v /vendor/)

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
