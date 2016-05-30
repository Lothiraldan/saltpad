FROM ubuntu:14.04
MAINTAINER Boris Feld <lothiraldan@gmail.com>

ENV DEBIAN_FRONTEND noninteractive

RUN apt-get update && apt-get upgrade -y -o DPkg::Options::=--force-confold

# Install salt-master deps
RUN apt-get install -y python-apt procps pciutils python-pip python-dev
RUN pip install https://github.com/saltstack/salt/archive/develop.zip cherrypy tornado

# Volume for saltpad deployment with rest_cherrypy

VOLUME /code

ADD config/run_salt_master.sh /run_salt_master.sh

ADD config/master /etc/salt/master

ADD config/minion /etc/salt/minion

ADD roots/ /srv/

EXPOSE 8000

EXPOSE 5417

# Add user vagrant with vagrant password
RUN useradd -m -p paX5EmO4EXy0I -s /bin/bash vagrant

CMD bash /run_salt_master.sh
