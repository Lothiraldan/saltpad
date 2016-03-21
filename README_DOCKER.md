# SaltPad docker


This will build a docker container to run saltpad in. It will use the file ```settings.json``` to configure
the container.

**Note: This will need more work to run in production, for now - only use for development.**

**Note: This will not setup your salt-master's salt-api or other requisites to be able to talke to salt, it only runs SaltPad. If you need a salt-api and salt-master for testing scroll down to saltpad with docker-compose**

## Build

You can build a saltpad image which will package the current version of the code located on your copy of this repository.

**Don't forget to create the ```settings.json``` file first**

```
docker build -t name/saltpad:latest .
```

## Run

After building it, you can launch it with this command:

```
docker run -p 3333:3333 name/saltpad:latest
```

# Saltpad with docker-compose


You can setup automatically a salt-api with salt-master and salt-minion for testing saltpad safely without impacting your production. It is also required for the moment as saltpad requires develop version of salt-api.

The image generated for salt-api will contains the latest develop version of salt, a salt-master, a salt-minion and two salt-api running in HTTP.

The salt-api running rest_cherrypy will run on port 8000 and should be available on your host with the same port, so you can put ```localhost:8000``` for ```API_URL``` in your file ```settings.json```.

The salt-api running rest_tornado will run on port 5417 and should be available on your host with the same port, so you can put ```localhost:5417``` for ```API_URL``` in your file ```settings.json```.

Depending on your setup, these ports may need to be mapped manually (like for example with docker-machine and virtualbox) or available on a different host (like with dlite). You can try to access via your browser on the salt-api URLs before trying to run saltpad, if they are not accessible via your browser, saltpad will not works.

## Build

It's very similar as for docker alone.

**Don't forget to create the ```settings.json``` file first**

```
docker-compose build
```

### Execute salt commands

If you need to execute salt commands on the salt-master, you can execute this command to launch a bash inside the salt-master container:

```
docker exec -t -i $(docker ps | grep "salt-api" | cut -d " " -f 1) bash
```

## Run

```
docker-compose run
```
