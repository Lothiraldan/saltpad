#!/bin/bash
set -e
set -x

salt-minion -d -l debug
salt-master -d
salt-api -l debug
