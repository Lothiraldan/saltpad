# Hack on saltpad

If you want to hack on saltpad and start the dev environment, go on the repository root and launch these commands:

```bash
npm install # install javascript dependencies
./node_modules/bower/bin/bower install # install bowser dependencies
cp settings.json.sample settings.json
```

You can now launch the dev environment:

```bash
npm start
```

SaltPad will be available on localhost:3333(localhost:3333).

# Release saltpad

If an any time you want to generate a new release and as a reminder for core-developer, here is how you can generate a dist.zip:

```bash
npm run build
```

It should generate a dist.zip file with every required file, the dist.zip.md5 file which contains the md5sum of the dist.zip file and the dist.zip.sha1 which contains the sha1sum of the dist.zip file.

Please note that you need first to follow the Hack on saltpad instructions to have the required dependencies.
