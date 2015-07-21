===============================
What is SaltPad?
===============================


SaltPad is a GUI tool to manage SaltStack deployments + orchestration. It's still very young and it's should be considered as Alpha.

.. image:: screenshots/highstate_result.png

A walkthrough using screenshots is available in the screenshots directory.

SaltPad compatibility
=====================

SaltPad is mainly coded in Python and is compatible with python2.X and python3.4.

SaltPad communicate with Salt through the salt-api. The salt-api format / specification is not stable, for now so SaltPad could only provides limited compatibility with salt-api. The salt-api format depends on 3 variables, salt version, the netapi used (cherrypy or tornado) and the master_job_cache used for storing and retrieving jobs results. We aim to provide maximum compatibility with the most frequent combinaison but while the format is not clearly specified, each combinaison would require an huge amount of work. Here is the compatibility table to quickly see if your configuration is supported or not:

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

SaltPad is not yet available on Pypi, so you can clone it here: git@github.com:tinyclues/saltpad.git.

.. code-block:: bash

    git clone git@github.com:tinyclues/saltpad.git

The recommended way to install saltpad is to create a dedicated virtualenv to isolate saltpad's dependencies from the system one (https://pypi.python.org/pypi/virtualenv/):

.. code-block:: bash

    cd saltpad
    virtualenv venv

On you create the virtualenv, you should see in the beginning of your terminal "(venv)", it means the virtualenv has been activated and that you will use the local python and local python packages. If "(venv)" is not printed, try running this command:

.. code-block:: bash

    source venv/bin/activate

Once you are in your virtualenv, you can now install all the dependencies, for easing the copy/paste, I omit the "(venv)"" in the start of the line:

    pip install -r requirements.txt

You're now ready to configure the salt-api, saltpad and starting playing with it! Please be sure to follow the next part of the Readme or you will not be able to connect to the salt-api.

Werkzeug dependency
-------------------

There is known issues with werkzeug:

- On windows platform, it raises strange errors about `_winreg` module, it's a known issue solved in the six project (https://bitbucket.org/gutworth/six/issue/99/six-and-inspect-importerror-_winreg-module) but not available right now. The fix is to use werkzeug version 0.9.4.
- On all platforms, werkzeug fails with python version 2.7.7, see https://github.com/mitsuhiko/werkzeug/issues/537. The fix is to use werkzeug version 0.9.6 and superior.

Due to this two conflictings problems, we can't fix the minimal werkzeug version and need to wait for the six release.

SaltPad Web GUI configuration
=============================

The Web GUI uses the HTTP Api of SaltStack to interract with the Salt-Master. You should first install the Salt-Api on your Salt-Master. You can find the documentation in the `SaltStack documentation`_.

If you just want to test SaltPad, you can use the Vagrantfile provided in vagrant directory. Just follow README in the same repository and have fun!

Install salt-api
----------------

The Salt-Api project has been merged into SaltStack in release 2014.7.0, so you can use the salt-api with SaltStack 2014.7.0 release or install salt-api with previous releases, you can install it using pip:

.. code:: bash

    pip install salt-api

Or if you're using a Debian-derived linux:

.. code:: bash

    sudo apt-get install salt-api

The salt-api requires some configuration too. Salt-api supports multiple implementation, but the rest_cherrypy implementation is the more mature and the recommended one when using saltpad. If you want to run salt-api and saltpad on the same host, you can configuration salt-api as followed in the file /etc/salt/master:

.. code:: yaml

    rest_cherrypy:
      port: 8000
      host: 127.0.0.1
      disable_ssl: true

Warning, this configuration disable ssl as it only listens to localhost, if you want to expose the salt-api to the network, you should really deploy it behind nginx with ssl, do not change the host to 0.0.0.0 without ssl!

With this salt-api configuration, the saltpad default configuration should work, if the salt-api and saltpad are not located on your device, you either could change the HOST settings in saltpad (but only for testing purposes, it will not use tls so all your data will be sent in clear text) or deploy it behind nginx with ssl configured.

Then you can launch the API using the following command:

.. code:: bash

    salt-api -d

Or using a wsgi server, see the doc for more informations.

Configure authentication
------------------------

You'll also need to `configure the external auth`_ in your salt master. For example in master config:

.. code-block:: bash

  external_auth:
    pam:
      myusername:
          - .*
          - '@runner'
          - '@wheel'

Currently SaltPad requires exactly these permissions, for various reasons. There is ongoing improvements on SaltStack part and in Saltpad to need less permissions. Saltpad will not allow you to connect if you don't have this set of permissions and will show you an error message.

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
