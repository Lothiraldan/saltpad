# SaltPad docker

Saltpad includes both a Dockerfile for creating a saltpad docker image and a docker-compose environement for you to play with.


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

# Saltpad with docker-compose and salt-api stable

There is an alternative Docker image that use salt-api stable instead of develop version.

The configuration is the same than the one on develop version, but it can help you test saltpad against a stable version of salt-api. For now, only the rest_cherrypy deployment works against the stable version, so you need to put ```localhost:8000``` for ```API_URL``` and ```/saltpad/``` for ```PATH_PREFIX``` in your file ```settings.json```. You will also need to build saltpad first, using the command ```npm run build```.

Please refer to the main README for more informations on the subject.

Uncomment the right ```dockerfile``` line in docker-compose.yml (the one actually commented), build the docker images with ```docker-compose build```, launch them with ```docker-compose up``` then access ```http://localhost:8000/saltpad``` to have access to saltpad.

# Saltpad docker image

The dockerfile will build a docker container to run saltpad in. It will use the file ```settings.json``` to configure
the container.

**Note: This will need more work to run in production, for now - only use for development.**

**Note: This will not setup your salt-master's salt-api or other requisites to be able to talke to salt, it only runs SaltPad. If you need a salt-api and salt-master for testing scroll up to saltpad with docker-compose**

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
