# Salt-api rest_tornado, version develop

Saltpad works with rest_tornado version develop in a very classic client/server way.

## Rest_tornado installation

Please follow the [official documentation](https://docs.saltstack.com/en/develop/ref/netapi/all/salt.netapi.rest_tornado.html).

## Basic rest_tornado configuration

The basic configuration for rest_tornado will look like this:

```
rest_tornado:
  port: 5417
  disable_ssl: true
  host: 127.0.0.1
  websockets: True
  cors_origin: '*'
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
Content-Length: 99
Server: TornadoServer/4.3
Etag: "aeff1152c7d469b8706b951c530e056620ee4624"
Date: Thu, 21 Apr 2016 02:59:37 GMT
Access-Control-Allow-Origin: *
Content-Type: application/json

{"clients": ["runner", "runner_async", "local_async", "local", "local_batch"], "return": "Welcome"}
```

If it's not the case, it means that salt-api is not working, please refer to official saltstack documentation for debugging.

## Validate external auth

In previous step, you have configured the external auth, you can now test it as salt-api is running with this command:

```
curl -i -H accept=application/json -d username=USER -d password=PASSWORD -d eauth=pam http://localhost:8000/login
```

In case of successful login you should have the response body that looks like that:

```
{"return": [{"perms": [".*", "@runner", "@wheel", "@jobs"], "start": 1461208514.615999, "token": "4db9214f3a90850243c4401ad4e6b213", "expire": 1461251714.615999, "user": "salt", "eauth": "pam"}]}
```

If the output includes "HTTP/1.1 401 Unauthorized", double-check the rest_tornado config and external auth config in salt-master config file.

## Saltpad installation

Released versions are available on github (https://github.com/Lothiraldan/saltpad/releases). You will need to download the latest version of saltpad from production:

```bash
wget https://github.com/Lothiraldan/saltpad/releases/download/v0.3.1/dist.zip
```

Unzip to a location of your choice (for example, `/code/saltpad`):

```bash
unzip dist.zip -d /code/
```

Rename the `/code/dist` directory to `/code/saltpad`:

```bash
mv /code/dist/ /code/saltpad/
```

Check that a `static` directory exists in the `/code/saltpad` directory which contains js and css files.

Now that saltpad is installed, it needs to be configured.

## Saltpad configuration

We will go with very basic configuration of saltpad first to test that everything works.

Create the file `settings.json` in the `/code/saltpad/static` directory with this content:

```json
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

