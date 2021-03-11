#!/bin/bash
set -e
set -u

# lock image
echo "locking images for [backman] ..."
ytt --ignore-unknown-comments -f templates -f values.yml | kbld -f - --lock-output "image.lock.yml"
