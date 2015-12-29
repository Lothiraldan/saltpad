===============================
What is SaltPad?
===============================


SaltPad is a GUI tool to manage SaltStack deployments + orchestration. It's still very young and it's should be considered as Alpha.

.. image:: screenshots/highstate_result.png

A walkthrough using screenshots is available in the screenshots directory (not up-to-date).

SaltPad compatibility
=====================

SaltPad is mainly coded in Javascript and should be compatible with all modern browsers.

SaltPad communicate with Salt through the salt-api and thus requires access to the salt-api from the browser. If it's an issue, please drop an comment on [this issue](http://github.com/tinyclues/saltpad) to discuss about the possible solutions. The salt-api format / specification is not stable, for now so SaltPad could only provides limited compatibility with salt-api. The salt-api format depends on 3 variables, salt version, the netapi used (cherrypy or tornado) and the master_job_cache used for storing and retrieving jobs results. We aim to provide maximum compatibility with the most frequent combinaison but while the format is not clearly specified, each combinaison would require an huge amount of work. Here is the compatibility table to quickly see if your configuration is supported or not:

+--------------+---------------+------------------+------------+-----------------------------------+
| Salt Version | Netapi        | Master_job_cache | Supported? | Issue if not supported            |
+--------------+---------------+------------------+------------+-----------------------------------+
| 2014.7.X     | *             | *                | NO         | Format incompatible with 2015.5.X |
+--------------+---------------+------------------+------------+-----------------------------------+
| 2015.5.2     | rest_cherrypy | local (default)  | YES        |                                   |
+--------------+---------------+------------------+------------+-----------------------------------+

Here is the list of issues about the salt-api format standardisation that would make the saltpad job much much easier:

* https://github.com/saltstack/salt/issues/23131
* https://github.com/saltstack/salt/issues/22713
* https://github.com/saltstack/salt/issues/19018
* https://github.com/saltstack/salt/issues/13698

Installation
============

You have several solutions to install saltpad but before installing saltpad, you need to install and configure salt-api.

Install salt-api
----------------

The Web GUI uses the HTTP Api of SaltStack to interract with the Salt-Master. You should first install the Salt-Api on your Salt-Master. You can find the documentation in the `SaltStack documentation`_.

The Salt-Api project has been merged into SaltStack in release 2014.7.0, so you can use the salt-api with SaltStack 2014.7.0 release or install salt-api with previous releases, you can install it using pip:

.. code:: bash

    pip install salt-api

Or if you're using a Debian-derived linux:

.. code:: bash

    sudo apt-get install salt-api

The salt-api requires some configuration too. Salt-api supports multiple implementation, but the rest_tornado implementation is the more mature and the recommended one when using saltpad. If you want to run salt-api and saltpad on the same host, you can configuration salt-api as followed in the file /etc/salt/master:

.. code:: yaml

    rest_cherrypy:
      port: 8000
      host: 127.0.0.1
      disable_ssl: true
      websockets: True
      cors_origin: '*'

Warning, this configuration disable ssl as it only listens to localhost, if you want to expose the salt-api to the network, you should really deploy it behind nginx with ssl, do not change the host to 0.0.0.0 without ssl!

With this salt-api configuration, the saltpad default configuration should work, if the salt-api and saltpad are not located on your device, you either could change the HOST settings in saltpad (but only for testing purposes, it will not use tls so all your data will be sent in clear text) or deploy it behind nginx with ssl configured.

Then you can launch the API using the following command:

.. code:: bash

    sudo /etc/init.d/salt-api restart

Or if you want to launch salt-api by hand.

.. code:: bash

    salt-api

Configure salt-api authentication
---------------------------------

You'll also need to `configure the external auth`_ in your salt master. For example in master config:

.. code-block:: bash

  external_auth:
    pam:
      myusername:
          - .*
          - '@runner'
          - '@wheel'

Currently SaltPad requires exactly these permissions, for various reasons. There is ongoing improvements on SaltStack part and in Saltpad to need less permissions. Saltpad will not allow you to connect if you don't have this set of permissions and will show you an error message.


Check salt-api configuration
----------------------------

You can check you salt-api installation and configuration with this command on the salt-api host:


.. code-block:: bash
    curl -i -H accept=application/json -d username=USER -d password=PASSWORD -d eauth=pam http://localhost:8000/login


In case of successful login you should have the response body that looks like that:

.. code-block:: bash
    {"return": [{"perms": [".*", "@runner", "@wheel"], "start": 1431010274.426576, "token": "70604a26facfe2aa14038b9abf37b639c32902bd", "expire": 1431053474.426576, "user": "salt", "eauth": "pam"}]}

If the output includes "HTTP/1.1 401 Unauthorized", double-check the salt-api config in salt-master config file.

Install saltpad
---------------

You can install a release version of saltpad on a web server with nginx or apache to serve it.

Releases versions are available on github (https://github.com/tinyclues/saltpad/releases). Download the distribution zip:

.. code-block:: bash

    wget https://github.com/tinyclues/saltpad/releases/0.1/dist.zip

Unzip it on your webserver where you want:

.. code-block:: bash

    cp dist.zip /opt/saltpad
    cd /opt/saltpad
    unzip dist.zip

Then point your favorite webserver on the directory. For example, for an unsecured (HTTP) saltpad install with nginx, the configuration will be:

.. code-block:: nginx

    server {
        listen 80 default_server;
        listen [::]:80 default_server ipv6only=on;

        root /opt/saltpad/;
        index index.html;

        server_name SALTPAD.YOURDNS;

        location / {
                try_files $uri /index.html;
        }
    }

You can put this configuration and replace the content of the file "/etc/nginx/sites-enabled/default" or ask your system administrator to configure Nginx or Apache.

Now reload the webserver:

.. code-block:: bash

    sudo /etc/init.d/nginx reload

And now, saltpad should be available on the web server, you can check with this command:

.. code-block:: bash

    curl http://localhost

THe output should looks like:

.. code-block::

    <!doctype html>
    <html lang="en" data-framework="react">
      <head>
        <meta charset="utf-8">
        <title>SaltPad</title>
      <link href="/styles.css" rel="stylesheet"></head>
      <body>
        <div class="app"></div>
      <script src="/vendors.js"></script><script src="/app.js"></script></body>
    </html>

SaltPad Web GUI configuration
=============================

If you just want to test SaltPad, you can use the Vagrantfile provided in vagrant directory. Just follow README in the same repository and have fun!


Configure SaltPad
-----------------

If your checklist is done, you can now configure SaltPad.

Get into the saltpad directory, copy the file named "local_settings.sample.py" as "local_settings.py". You'll need to edit it. Set your API_URL if your salt-master is not local and generate a secret key if you want to avoid to reconnect each time your restart SaltPad.

Launch SaltPad
--------------

For testing purpose
___________________

When you just want to test saltpad in a local non-production environment, you can use the embedded webserver but be aware that this solution is not suitable for production environment with multiple users and where encryption is mandatory. You can start SaltPad with this command, note that you should be in the saltpad directory:

.. code:: bash

    / $> python run.py
     * Running on http://127.0.0.1:5000/
     * Restarting with reloader

Now go on http://127.0.0.1:5000 in your browser, login using SaltStack external auth and enjoy!

In production environment
_________________________

You should deploy saltpad using a wsgi server behind a real webserver like nginx or haproxy.

For example you can use chaussette (https://chaussette.readthedocs.org/en/latest/) to launch saltpad. In the saltpad repository root:

.. code:: bash

    saltpad/ $> chaussette saltpad.app:app
    2015-04-05 12:34:04 [58304] [INFO] Application is <Flask 'SaltPad'>
    2015-04-05 12:34:04 [58304] [INFO] Serving on localhost:8080
    2015-04-05 12:34:04 [58304] [INFO] Using <class chaussette.backend._wsgiref.ChaussetteServer at 0x102f267a0> as a backend

You can also serve the wsgi app with the wsgi server of your choice. The wsgi path is "saltpad.app:app" and you should launch the wsgi server in the root of this repository.

Now configure your favorite webserver to listen on the port 443 with tls enabled. For example with nginx:


.. code::

    http {
        server {
            listen 443 ssl;
            server_name YOURDNS.EXTENSION;
            ssl_certificate /etc/pki/tls/certs/wildcard.saltpad.net.crt;
            ssl_certificate_key /etc/pki/tls/certs/wildcard.saltpad.net.pem;

            location / {
                proxy_pass http://localhost:8080/;
                proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
                proxy_set_header Host $http_host;
                proxy_set_header X-Real-IP $remote_addr;
            }
        }
    }

Be sure to change the server_name and check that your ssl certificate paths are corrects.

Then restart nginx, go to https://YOURDNS.EXTENSION/ and enjoy!

Features
--------

* Get overview of all your minions.
* Get details about each minions, its Salt version.
* Easy launch of state.highstate jobs with or without dry-run mode.
* Manage minions keys.
* Launch jobs.
* Access jobs details easily.
* Save job configuration as templates and launch them with one click on a button.
* Quick debug minion, get all usefull information in one place.

.. _SaltStack documentation: http://docs.saltstack.com/en/latest/ref/netapi/all/salt.netapi.rest_cherrypy.html
.. _configure the external auth: http://docs.saltstack.com/en/latest/topics/eauth/index.html

Known issues
------------

* When getting single job output, SaltStack render it even if it's not necessary. This can cause severe slowdown and so slow the interface. It's a known issue in SaltStack (https://github.com/saltstack/salt/issues/18518) and it's should be solved in next release. If it's a problem, you can comment this line https://github.com/saltstack/salt/blob/v2014.7.0/salt/runners/jobs.py#L102 and this line https://github.com/saltstack/salt/blob/v2014.7.0/salt/runners/jobs.py#L81 in your salt master to speed up the job retrieval system.
* In 2015.5.X version, the job result miss some important informations like the arguments of the job, the target of the job and the target-type (glob, compound...) making job result page less usefull and making the redo-job button unusable. See this issue in SatlStack (https://github.com/saltstack/salt/issues/21496#event-339068972).
