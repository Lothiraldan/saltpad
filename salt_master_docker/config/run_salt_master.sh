#!/bin/bash
set -e
set -x

salt-minion --versions-report
salt-minion -d
salt-master --versions-report
salt-master -d
salt-api --versions-report
salt-api -l debug
