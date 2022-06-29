#!/bin/bash
set -e
set -u

# diff
kapp app-change list -a backman
ytt --ignore-unknown-comments -f templates -f values.yml |
	kapp deploy -a backman -c --diff-run -f -
