#!/bin/bash
set -e
set -u

# deploy
echo "deploying [backman] ..."
ytt --ignore-unknown-comments -f templates -f values.yml |
	kapp deploy -a backman -c -y -f -
kapp app-change garbage-collect -a backman --max 5 -y
