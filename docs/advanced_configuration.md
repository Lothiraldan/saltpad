# Advanced configuration

## Eauth

Saltpad allow the configuration of the eauth system to login against. It default to `pam` and is configured by `EAUTH` key in settings.json file.
Check out the [saltstack documentation about eauth](https://docs.saltstack.com/en/develop/topic/eauth/index.html) for supported eauth system like ldap or active directory.

## Templates

Saltpad allow you to configure templates, predefined jobs that you can launch or copy in a single click.

They're defined under the `templates` key in settings.json file with the following format:

```
"basic": { # Template name
    "description": "Basic template", # Template description
    "matcher": "glob", # Template matcher, any of
    "target": "*", # The minions of the template
    "moduleFunction": "test.fib", # The function to run
    "arguments": { # The arguments to pass, always a dict
        "num": 10
    }
},
```

The templates should appear on `/job/template` url in the templates page.

## Path prefix

The path prefix settings configured under the `PATH_PREFIX` key is mandatory for rest_cherrypy embedded deployment mode but can also be leveraged for serving saltpad at a subdirectory.

If you want to access saltpad at the url `http://salt.yourcompany.com/saltpad/`, you need to set `PATH_PREFIX` to `/saltpad/`. Be careful, leading / is mandatory.
