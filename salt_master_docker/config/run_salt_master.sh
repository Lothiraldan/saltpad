#!/bin/bash
set -e
set -x

salt-minion -d
salt-master -d
salt-api -l debug
