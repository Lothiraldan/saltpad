# Salt-api rest_cherrypy, version develop

Saltpad works with rest_tornado version develop in a very classic client/server way.

## Rest_cherrypy installation

Please follow the [official documentation](https://docs.saltstack.com/en/latest/ref/netapi/all/salt.netapi.rest_cherrypy.html), rest_cherrypy especially depends on cherrypy that you can install with your package manager.

## Basic rest_cherrypy configuration

The basic configuration for rest_cherrypy will look like this:

```
rest_cherrypy:
  port: 8000
  host: 127.0.0.1
  disable_ssl: True
```

__Warning, this configuration has ssl disabled and it only listens to localhost, if you want to expose the salt-api to the network, you should really deploy it behind nginx with ssl, do not change the host to 0.0.0.0 without proper ssl support as well! It's documented later how to proper deploy ssl for protecting the salt-api, for the moment doesn't touch the host nor disable_ssl.__

These lines to be located inside your salt-master configuration.

You can now launch the salt-api, either manually:

```
salt-api -l info
```

Or with your OS init system, for example on ubuntu:

```
sudo start salt-api
```

You can now check that the salt-api is listening to the network with this command launched from the salt-master:

```
curl -i http://localhost:8000/
```

The output should show something like this:

```
HTTP/1.1 200 OK
Content-Length: 181
Access-Control-Expose-Headers: GET, POST
Vary: Accept-Encoding
Server: CherryPy/5.1.0
Allow: GET, HEAD, POST
Access-Control-Allow-Credentials: true
Date: Wed, 20 Apr 2016 23:26:54 GMT
Access-Control-Allow-Origin: *
Content-Type: application/json
Set-Cookie: session_id=4e1435ec4ff88ea9069d21e36deba3ede71cea79; expires=Thu, 21 Apr 2016 09:26:54 GMT; Path=/

{"clients": ["_is_master_running", "local", "local_async", "local_batch", "local_subset", "runner", "runner_async", "ssh", "ssh_async", "wheel", "wheel_async"], "return": "Welcome"}
```

If it's not the case, it means that salt-api is not working, please refer to official saltstack documentation for debugging.

## Validate external auth

In previous step, you have configured the external auth, you can now test it as salt-api is running with this command:

```
curl -i -H accept=application/json -d username=USER -d password=PASSWORD -d eauth=pam http://localhost:8000/login
```

In case of successful login you should have the response body that looks like that:

```
{"return": [{"perms": [".*", "@runner", "@wheel"], "start": 1431010274.426576, "token": "70604a26facfe2aa14038b9abf37b639c32902bd", "expire": 1431053474.426576, "user": "salt", "eauth": "pam"}]}
```

If the output includes "HTTP/1.1 401 Unauthorized", double-check the rest_cherrypy config and external auth config in salt-master config file.

## Saltpad installation

Released versions are available on github (https://github.com/Lothiraldan/saltpad/releases). You will need to download the latest version of saltpad from production:

```
wget https://github.com/Lothiraldan/saltpad/releases/download/v0.3.1/dist.zip
```

Unzip to a location of your choice (for example, `/code/saltpad`):

```
unzip dist.zip -d /code/
```

Rename the `/code/dist` directory to `/code/saltpad`:

```
mv /code/dist/ /code/saltpad/
```

Check that a `static` directory exists in the `/code/saltpad` directory which contains js and css files.

Now that saltpad is installed, it needs to be configured.

## Saltpad configuration

We will go with very basic configuration of saltpad first to test that everything works.

Create the file `settings.json` in the `/code/saltpad/static` directory with this content:

```
{
    "API_URL": "localhost:8000",
    "SECURE_HTTP": false,
    "FLAVOUR": "rest_tornado"
}
```

Adapt the `API_URL` to your environment but doesn't touch `SECURE_HTTP` and `FLAVOUR` right now, we need to be sure that everything works before configuring it in more details.

Saltpad should now be correctly configured but the saltpad file still need to be served by a web server.

If you have some experience with some web server (like Apache or nginx), please follow the instructions in the right section below. If you don't have experience with either, please follow the instructions for nginx, it will be easier.

## Serve saltpad with nginx

If you want to serve saltpad with nginx, please follow [these instructions](nginx-server.md).

## Serve saltpad with apache

If you want to serve saltpad with apache, please follow [these instructions](apache-server.md).
