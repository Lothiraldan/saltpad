# SaltPad docker

Saltpad includes both a Dockerfile for creating a saltpad docker image and a docker-compose environement for you to play with.


# Saltpad with docker-compose

You can setup automatically a salt-api with salt-master and salt-minion for testing saltpad safely without impacting your production.

The image generated for salt-api will contains the latest stable version of salt, a salt-master, a salt-minion and two salt-api running in HTTP. You can this way test with your configured salt-api implementation or the other one very easily.

The salt-api running rest_cherrypy will run on port 8000 and should be available on your host with the same port, so you can put ```localhost:8000``` for ```API_URL``` in your file ```settings.json```.

The salt-api running rest_tornado will run on port 5417 and should be available on your host with the same port, so you can put ```localhost:5417``` for ```API_URL``` in your file ```settings.json```.

> You need to put only one `API_URL` in your `settings.json` file.

Depending on your setup, these ports may need to be mapped manually (like for example with docker-machine and virtualbox) or available on a different host (like with dlite). You can try to access via your browser on the salt-api URLs before trying to run saltpad, if they are not accessible via your browser, saltpad will not works.

## Build

It's very similar as for docker alone.

**Don't forget to create the ```settings.json``` file first in the root directory**

The `docker-compose.yml` file is in the root directory of the repository, you can build the different docker images with this command launched also from the root directory:

```
docker-compose build
```


### Custom salt version

You can choose a different version of salt to play with. Just edit the file ```salt_master_docker/Dockerfile_stable``` and change the `SALT_VERSION` variable. You'll need to rerun the `docker-compose build` command after modifying this variable.

#### Old salt version

If you want to try saltpad with a salt version older than 2016.3.0, your `settings.json` will be a little different.

You'll need first to build saltpad locally with this command launch from the root directory:

`npm run build`

In old versions, only the rest_cherrypy deployment works against the stable version, so you need to put ```localhost:8000``` for ```API_URL``` and ```/saltpad/``` for ```PATH_PREFIX``` in your file ```settings.json```.

You should then be able to access saltpad on this url: `http://localhost:8000/saltpad`.

Please refer to the main (documentation)[https://github.com/Lothiraldan/saltpad/blob/master/docs/installation/salt-api-cherrypy-embedded.md] for more informations on the subject.

## Run

Now that you have built the docker images, you can launch them, it will start two docker container, one with a salt-master, a salt-minion and the two implementations of salt-api and one with saltpad itself. This command need to be launched from the root directory:

```
docker-compose run
```

The cherry-py salt-api should be accessible at: `http://localhost:8000`, the tornado salt-api should be accessible at: `http://localhost:5417` and saltpad should be accessible at: `http://localhost:3333`.

### Execute salt commands

If you need to execute salt commands on the salt-master, you can execute this command to launch a bash inside the salt-master container:

```
docker exec -t -i $(docker ps | grep "salt-api" | cut -d " " -f 1) bash
```

# Saltpad with docker-compose and salt-api develop

The docker-compose environment introduced earlier starts a stable version of salt-api.

There is an alternative salt-master Docker image that use salt-api develop instead of stable version.

Uncomment the right ```dockerfile``` line in docker-compose.yml (the one actually commented), build the docker images with ```docker-compose build```, launch them with ```docker-compose up``` then access ```http://localhost:3333/``` to have access to saltpad.

# Saltpad docker image

The dockerfile located in the root directory will build a docker container to run saltpad in. It will use the file `settings.json` co-located in the root directory to configure the container.

**Note: This will need more work to run in production, for now - only use for development.**

**Note: This will not setup your salt-master's salt-api or other requisites to be able to talke to salt, it only runs SaltPad. If you need a salt-api and salt-master for testing scroll up to saltpad with docker-compose**

## Build

You can build a saltpad image which will package the current version of the code located on your copy of this repository.

**Don't forget to create the ```settings.json``` file first with informations for either a local salt-api you configured earlier or a staging salt-api**

```
docker build -t name/saltpad:latest .
```

## Run

After building it, you can launch it with this command:

```
docker run -p 3333:3333 name/saltpad:latest
```
