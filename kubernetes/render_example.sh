#!/bin/bash
set -e
set -u

# rendering example
echo "rendering [backman] example ..."
ytt --ignore-unknown-comments -f templates -f sample_values.yml |
	kbld -f - -f image.lock.yml > example/deploy.yml
