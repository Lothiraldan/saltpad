# Change Log

## [0.3](https://github.com/tinyclues/saltpad/tree/0.3) (2016-03-03)

- Make the external_auth configurable in the settings. It is optional and the default value is 'pam'.
- Better support for highstate with minions in error.
- Fix some style issues for Firefox.
- Add beta support for rest-cherrypy with embedded single-app page deployment.
- Add support for prefix configuration required by the support for embedded single-app page deployment but could be usefull in other cases.
- Update the docker environment and add a docker-compose with salt-api linked container.

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
