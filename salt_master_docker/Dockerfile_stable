FROM ubuntu:14.04
MAINTAINER Boris Feld <lothiraldan@gmail.com>

ENV DEBIAN_FRONTEND noninteractive

RUN apt-get update && apt-get upgrade -y -o DPkg::Options::=--force-confold

ENV SALT_VERSION=2016.3.0

# Install salt-master deps
RUN apt-get install -y python-apt procps pciutils python-pip python-dev
RUN pip install salt==$SALT_VERSION cherrypy tornado

# Volume for saltpad deployment with rest_cherrypy

VOLUME /code

ADD roots/ /srv/

ADD config/run_salt_master.sh /run_salt_master.sh

ADD config/master /etc/salt/master

ADD config/minion /etc/salt/minion

EXPOSE 8000

EXPOSE 5417

# Add user vagrant with vagrant password
RUN useradd -m -p paX5EmO4EXy0I -s /bin/bash vagrant

CMD bash /run_salt_master.sh
