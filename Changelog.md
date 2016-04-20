# Change Log

## [0.3.1](https://github.com/tinyclues/saltpad/tree/0.3.1) (2016-04-19)

No-feature release for v0.3, fixing the archive behavior not creating the 'static' directory, users please update to this release!

- Fix the dist.zip archive to correctly create the "static" directory. Sorry for the inconvenience.
- The "settings.json" file should be located in the "static" directory and not in a "config" directory, documentation has been fixed.

## [0.3](https://github.com/tinyclues/saltpad/tree/0.3) (2016-03-03)

This release has been updated and a new dist.zip has been uploaded, it may have broke any script which uses the old md5 with the same archive url, sorry for the inconvenience. I'll release a 0.3.1 right now to fix this and delete downloads for this release.

This release focus on most-requests feature, the support of rest_cherrypy stable! It landed in the v0.3 version in beta for the moment. Here is the detailed changelog:

- Make the external_auth configurable in the settings. It is optional and the default value is 'pam'.
- Better support for highstate with minions in error.
- Fix some style issues for Firefox.
- Add beta support for rest-cherrypy with embedded single-app page deployment.
- Add support for prefix configuration required by the support for embedded single-app page deployment but could be usefull in other cases.
- Update the docker environment and add a docker-compose with salt-api linked container.

The Readme has been updated to include all required informations for testing saltpad with the new docker environment and against a rest_cherrypy stable version on your production.

The settings.json file should now be placed in static/ directory, apart from that upgrade doesn't requires particular steps, download the new dist.zip, check it md5sum or sha1sum and it should works!

## [0.2](https://github.com/tinyclues/saltpad/tree/0.2) (2016-01-22)

This release focus on error reporting and fixing the few issues that were found by early testers:

- Error page when saltpad couldn't load the settings file.
- Error message on token expiration.
- Error message on invalid credentials.
- Fix the "Mixed Content" due to google fonts css was loaded over http.
- Improve the performance by avoiding multiple rendering.
- Numerous contribution on the README.

Upgrade doesn't requires particual steps, download the new dist.zip, check it md5sum or sha1sum and it should works!

Big thank you to the contributors who helped both alpha-test this release and made big contributions!

## [0.1](https://github.com/tinyclues/saltpad/tree/0.1) (2016-01-06)

Saltpad has been entirely rewritten as a single app page using React. This leads to several enhancements:

- Better responsiveness.
- More interactive.
- Helps solves the job launching UX.
- Easier to deploy.

This rewrite and architecture change now require that the salt-api is contactable from the browser directly. If it's a concern for you and don't want to use the new version because of it, please open an issue.
