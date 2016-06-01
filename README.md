# What is SaltPad?

SaltPad is a GUI tool to manage SaltStack deployments + orchestration. It's still very young and it should be considered as Alpha.

![Image of saltpad](screenshots/highstate_result.png)

A walkthrough using screenshots is available in the screenshots directory (not up-to-date).

**This version of saltpad is a full-rewrite as a single app page. The old version in python is still available in the saltpad_v1 branch (https://github.com/tinyclues/saltpad/tree/saltpad_v1). If you cannot use this version, please open an issue to ease migration and see the Changelog (https://github.com/tinyclues/saltpad/blob/master/Changelog.md).**

## Features

* Get overview of all your minion.
* Get details about each minions, its Salt version.
* Easy launch of state.highstate jobs with or without dry-run mode.
* Manage minion keys.
* Launch jobs.
* Access jobs details easily.
* Save job configuration as templates and launch them with one click on a button.
* Quick debug minion, get all useful information in one place.

## Installation and documentation

You can follow installation instructions and more documentation [in the docs directory](docs/README.md).
