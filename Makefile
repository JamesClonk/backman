.PHONY: run build prepare-test test
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
