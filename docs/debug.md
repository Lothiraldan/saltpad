# Debug

This doc helps you to debug some common issues with saltpad and the salt-api.

## Login error

Sometime, you cannot log to saltpad while it's working perfectly fine with the salt command line. Saltpad is based solely on salt-api for login so the issue is likely to be on salt-api side. You can try to login using curl:

```
curl -i -H accept=application/json -d username=USER -d password=PASSWORD -d eauth=pam https://YOURSALTAPI/login
```

In case of successful login you should have the response body that looks like that:

```
{"return": [{"perms": [".*", "@runner", "@wheel"], "start": 1431010274.426576, "token": "70604a26facfe2aa14038b9abf37b639c32902bd", "expire": 1431053474.426576, "user": "salt", "eauth": "pam"}]}
```

Double-checks your permissions (`perms` field) and if everything is fine, the issue is likely to be on saltpad side, please [open an issue](https://github.com/tinyclues/saltpad/issues), we will fix it.

In case of a bad username and/or password, the output looks like:

```
HTTP/1.1 401 Unauthorized
...
```

The body will be different depending on the salt-api implementation. Double-check the username / password and if they are the good ones, please open a [salt issue](https://github.com/saltstack/salt/issues).
