===============================
Test SaltPad with vagrant
===============================


From this repository, just run 'vagrant up' and go to http://localhost:8080 in
your browser when provisionning is finished. Login to SaltPad using vagrant/vagrant.

If you encounter errors like https://github.com/tinyclues/saltpad/issues/104 or like https://github.com/tinyclues/saltpad/issues/108, please be sure to have an up-to-date vagrant and remove any version of vagrant-salt (https://github.com/saltstack/salty-vagrant) as it has been included in vagrant itself.
