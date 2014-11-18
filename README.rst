===============================
What is SaltPad?
===============================


SaltPad is a GUI and CLI tool to manage SaltStack deployments + orchestration. It's still very young and it's should be considered as Alpha.

Installation
============

SaltPad is not yet available on Pypi, so you can clone it here: git@github.com:tinyclues/saltpad.git.

.. code-block:: bash

    git clone git@github.com:tinyclues/saltpad.git

SaltPad Web GUI configuration
=============================

The Wed GUI use the HTTP Api of SaltStack to interract with the Salt-Master. You should first install the Salt-Api on your Salt-Master. You can find the documentation in the `SaltStack documentation`_.

Install salt-api
----------------

The Salt-Api project has been merged into SaltStack in release 2014.7.0 but this merge seems to have introduced some changes in the API and so SaltPad is not compatible with SaltStack 2014.7.0 (yet!). Please use the release 2014.1.Z and install salt-api separately using pip:

.. code:: bash

    pip install salt-api

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

You can also serve the wsgi app with the wsgi server of your choice. The wsgi path is "saltpad.saltpad".

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

SaltPad CLI CONFIGURATION
=========================

TODO

SaltPad vagrant CLI CONFIGURATION
=================================

TODO
