#!/bin/bash
set -e
set -u

# rendering example
echo "rendering [backman] examples ..."
ytt --ignore-unknown-comments -f templates -f values.yml -f example_values_full.yml > ../deploy/full.yml
ytt --ignore-unknown-comments -f templates -f values.yml -f example_values_minimal.yml > ../deploy/minimal.yml
