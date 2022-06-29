#!/bin/bash
set -e
set -u

# status
kapp app-change list -a backman
kapp inspect -a backman --tree
