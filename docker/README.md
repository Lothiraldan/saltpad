SaltPad docker
==============

This will build a docker container to run saltpad in. It will use the file ```local_settings.docker``` to configure
the container.

*Note: This will need more work to run in production, for now - only use for development.*

*Note: This will not setup your salt-master's salt-api or other requisites to be able to talke to salt, it only
runs SaltPad*

Build
-----

```
docker build -t name/saltpad:latest .
```

Run
---

```
docker run -p 5000:5000 name/saltpad:latest
```
