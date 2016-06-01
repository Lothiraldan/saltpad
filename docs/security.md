# Security

Saltpad access via salt-api, the first part of security is the eauth configuration in salt-master (see [installation](installation/index.md) for more details).

Saltpad works best with full-right access accounts but some work is ongoing to have a better support for fine-grain right management on salt-master side (see [https://github.com/saltstack/salt/issues/21679](https://github.com/saltstack/salt/issues/21679)).

## Information stored

Saltpad tries very hard to not store confidential data on your browser. The only information stored are:

* Last jobs ids launched via saltpad
* Followeds jobs ids
* The salt-api token used for authentication

Saltpad will never store any minion information or job information in your browser.
