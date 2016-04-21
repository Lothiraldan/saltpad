# Saltpad production installation

Please follow this documentation step-by-step to finalize the saltpad + salt-api installation and configuration.

You have several solutions to install saltpad, but before installing saltpad, you need to install and configure salt-api.

## Installing salt-api

The [salt-api](https://docs.saltstack.com/en/latest/topics/netapi/) documentation is not very detailed but basically, either salt-api is already installed with your salt-master (try running `salt-api --version` on your salt-master) or your package manager includes a separated package named salt-api. For example, on Debian based OSes:

```bash
sudo apt-get install salt-api
```

## Salt-api authentication

Salt-api leverage the [external auth](https://docs.saltstack.com/en/latest/topics/eauth/access_control.html) system to authenticate and allow users to run commands against the salt-master.

A full-access access for user `bob` might look like:

```yaml
external_auth:
    pam:
      bob:
          - .*
          - '@runner'
          - '@wheel'
```

Currently SaltPad requires exactly these permissions, for various reasons. There is ongoing improvements on SaltStack part and in Saltpad to require less permissions. Saltpad will not allow you to connect if you don't have this set of permissions and will show you an error message.

## Salt-api configuration

As explains in [requirements](../requirements.md), saltpad has some dependencies on the salt-api implementation and salt-master version.

If you have already a salt-api installed and configured, follow instructions matching your salt-api implementation and salt-master version below.

If you don't have actually a salt-api configured, I recommend that to follow the instructions for rest-cherrypy, salt 2015.8.8 as putting a develop version of saltstack is a very bad idea.

## Salt 2015.8.8, rest_cherrypy

Saltpad works with rest-cherrypy 2015.8.8 with a specific deployment options, follow [these instructions to configure salt-api](salt-api-cherrypy-embedded.md).

## Salt 2016.3.X, rest_tornado

Starting with version 2016.3.X, rest_tornado should be compatible with the most simple deployment option, please follow [these instructions to configure salt-api with rest_tornado](salt-api-tornado-cors.md).

## Salt 2016.3.X, rest_cherrypy

Starting with version 2016.3.X, rest_tornado should be compatible with the most simple deployment option, please follow [these instructions to configure salt-api with rest_cherrypy](salt-api-cherrypy-cors.md).
