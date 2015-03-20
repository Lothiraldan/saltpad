===============================
What is SaltPad?
===============================


SaltPad is a GUI tool to manage SaltStack deployments + orchestration. It's still very young and it's should be considered as Alpha.

.. image:: screenshots/highstate_result.png

A walkthrough using screenshots is available in the screenshots directory.

Installation
============

SaltPad is not yet available on Pypi, so you can clone it here: git@github.com:tinyclues/saltpad.git.

.. code-block:: bash

    git clone git@github.com:tinyclues/saltpad.git
    
SaltPad currently only works on Python 2.7, but the support of Python 2.6 is currently discussed here, please leave a comment if it's a big issue for you.

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

Configure SaltPad
-----------------

If your checklist is done, you can now configure SaltPad.

Get into the saltpad directory, copy the file named "local_settings.sample.py" as "local_settings.py". You'll need to edit it. Set your API_URL if your salt-master is not local and generate a secret key if you want to avoid to reconnect each time your restart SaltPad.

Launch SaltPad
--------------

Now start SaltPad with this command, note that you should be in the saltpad directory:

.. code:: bash

    saltpad/ $> python app.py
     * Running on http://127.0.0.1:5000/
     * Restarting with reloader

You can also serve the wsgi app with the wsgi server of your choice. The wsgi path is "app:app" and you should launch the wsgi server in the root of this repository.

Now go on http://127.0.0.1:5000 in your browser, login using SaltStack external auth and enjoy!

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
