#!/usr/bin/env python
# -*- coding: utf-8 -*-

import os
import sys
import logging

from subprocess import check_output
from saltpad import SaltPad, call, bool_choice
from saltpad import Deploy as BaseDeploy
from plumbum import cli, local
from vagrant import Vagrant, SandboxVagrant
from clint.textui import colored, puts, indent
from os import listdir, mkdir
from os.path import isfile, join, isdir, abspath
from jinja2 import Environment, meta
from shutil import copy
from time import sleep


def get_output_cmd(command, minion_path):
    with local.cwd(minion_path):
        return check_output("vagrant ssh -c \"{0}\"".format(command), shell=True)


class VagrantManagerMixin(object):

    def execute_vagrant_command_on_minion(self, project_name, command):
        minion_path = self.parent.config['minions'][project_name]
        vagrant = Vagrant(minion_path, quiet_stdout=False, quiet_stderr=False)

        puts(colored.blue("Execute vagrant %s on minion %s" % (command, project_name)))
        getattr(vagrant, command)()

        puts(colored.blue("Done"))


@SaltPad.subcommand("register_dir")
class RegisterDir(cli.Application):
    """
    Search in a directory for a Vagrantfile.template file and a
    minions_configurations dir.
    """

    def main(self, templates_directory):
        templates_directory = abspath(templates_directory)
        puts(colored.blue("Looking in %s for templates" % templates_directory))

        # Check for VagrantFile template file
        vagrantfile_template = join(templates_directory, 'Vagrantfile.template')
        if isfile(vagrantfile_template):
            puts(colored.blue("Found a Vagrantfile template: %s" % vagrantfile_template))

            self.parent.config.setdefault('vagrantfiles', {})['default'] = vagrantfile_template
        else:
            puts(colored.yellow("No Vagrantfile template found: %s" % vagrantfile_template))

        # Check for minions configurations
        minions_conf = join(templates_directory, 'minions_configurations')
        if isdir(minions_conf):
            logging.info("Found a minion configuration directory: %s" % minions_conf)

            for filename in listdir(minions_conf):
                filepath = join(minions_conf, filename)
                puts(colored.blue("Found minion conf: %s" % filepath))

                self.parent.config.setdefault('minion_conf', {})[filename] = filepath
        else:
            puts(colored.yellow("No minion configuration directory found: %s" % minions_conf))

        # Write config file
        self.parent.write_config_file()


@SaltPad.subcommand("create_vm")
class CreateVm(cli.Application, VagrantManagerMixin):

    def main(self, project_name):
        # Check directory
        project_path = abspath(project_name)
        if isdir(project_path):
            puts(colored.red("The directory %s already exists, abort" % project_path))
            sys.exit(1)

        # Choose minion configuration
        if len(self.parent.config.get('minion_conf', [])) == 0:
            puts(colored.red("You must register at least one minion configuration,"
                "use register_dir command to do so."))
            sys.exit(1)
        if len(self.parent.config.get('minion_conf', [])) == 1:
            minion_conf = self.parent.config['minion_conf'].values()[0]
        else:
            minion_list = sorted(self.parent.config['minion_conf'].keys())
            while True:
                puts(colored.blue("Please choose a minion configuration:"))
                for i, minion in enumerate(minion_list):
                    print "%s) %s" % (i, minion)
                try:
                    minion_conf = minion_list[int(raw_input("Your choice: "))]
                    break
                except IndexError, ValueError:
                    continue

            minion_conf = self.parent.config['minion_conf'][minion_conf]

        puts(colored.blue("Using %s as minion configuration" % minion_conf))

        ##
        # TODO CHECK IF PROJECT_NAME == MINION_CONFIGURATION
        # ELSE MODIFY
        ##

        # Prepare vagrant file

        # Choose vagrantfile
        if len(self.parent.config.get('vagrantfiles', {})) == 0:
            logging.error("You must register at least one Vagrantfile, use"
                "register_dir command to do so.")
            sys.exit(1)
        if len(self.parent.config.get('vagrantfiles', {})) == 1:
            vagrantfile = self.parent.config['vagrantfiles']['default']
        else:
            raise Exception("More than one Vagrantfile, TODO")

        puts(colored.blue("Using %s as VagrantFile template" % vagrantfile))

        # Get declared variables
        env = Environment()
        with open(vagrantfile) as f:
            vagrantfile_template = f.read()

        missing_variables = meta.find_undeclared_variables(env.parse(vagrantfile_template))
        missing_variables.remove('project_name')
        variables = {'project_name': project_name}

        if missing_variables:
            puts(colored.blue("Please enter VagrantFile template variables:"))

        # Prompt them
        for variable_name in missing_variables:
            variables[variable_name] = raw_input("%s: " % variable_name)

        # Render vagrantfile
        rendered_vagrantfile = env.from_string(vagrantfile_template).render(variables)

        # Create directory
        mkdir(project_path)
        copy(minion_conf, join(project_path, 'minion'))
        with open(join(project_path, 'Vagrantfile'), 'w') as f:
            f.write(rendered_vagrantfile)

        # Generate keys
        puts(colored.blue("Generating keys for minion"))
        call("salt-key --gen-keys=%s --gen-keys-dir=%s" % (project_name, project_path))
        # Copy it on master
        call("cp %s/%s.pub /etc/salt/pki/master/minions/%s" % (project_path, project_name, project_name))

        # Register VM
        self.parent.config.setdefault('minions', {})[project_name] = project_path

        self.parent.write_config_file()

        puts(colored.blue("Done"))

        if 'EDITOR' in os.environ:
            # Edition of minion configuration
            puts(colored.blue("Would you like to edit minion configuration?"))
            choice = bool_choice("Yes/No: ")

            if choice:
                call("$EDITOR %s" % join(project_path, 'minion'))
                puts(colored.blue("Edition done"))

        # Done
        puts(colored.blue("Would you like to run vagrant up on VM?"))
        choice = bool_choice("Yes/No: ")

        if choice:
            VagrantUp.parent = self.parent
            VagrantUp.run(['up', project_name])


@SaltPad.subcommand("status")
class Status(cli.Application):

    def main(self):
        for minion_name, minion_path in self.parent.config.get('minions', {}).items():
            vagrant = Vagrant(minion_path)
            vagrant_status = vagrant.status()[0].state
            salt_status = self.parent.client.get_minion_status(minion_name)
            puts("%s:" % minion_name)
            with indent(4):
                puts("vagrant status: %s" % vagrant_status)
                puts("saltstack status: %s" % salt_status)


@SaltPad.subcommand("up")
class VagrantUp(cli.Application, VagrantManagerMixin):

    def main(self, project_name):
        minion_path = self.parent.config['minions'][project_name]
        self.execute_vagrant_command_on_minion(project_name, 'up')

        # Get back master IP
        puts(colored.blue("Check master ip"))
        command = "/sbin/ifconfig eth1 | grep 'inet addr:' | cut -d: -f2 | cut -d' ' -f 1"
        vm_ip = get_output_cmd(command, minion_path)

        vm_ip = vm_ip.split('.')
        vm_ip[-1] = '1'
        master_ip = ".".join(vm_ip)

        # Check declared master ip
        command = "grep master /etc/salt/minion"
        declared_master_ip = get_output_cmd(command, minion_path)
        declared_master_ip = declared_master_ip.split()[-1]

        change = False

        if declared_master_ip != master_ip:
            puts(colored.yellow("Master ip on minion is invalid, {0} instead of {1}".format(declared_master_ip, master_ip)))

            # Replace master ip
            command = "sudo sed -i 's/{0}/{1}/g' /etc/salt/minion".format(declared_master_ip, master_ip)
            result = get_output_cmd(command, minion_path)

            # Reboot minion
            command = "sudo /etc/init.d/salt-minion restart"
            result = get_output_cmd(command, minion_path)

            # Change minion
            command = "sed -i 's/{0}/{1}/g' {2}".format(declared_master_ip, master_ip, join(minion_path, 'minion'))
            check_output(command, shell=True)

            # Wait for minion to connect
            sleep(10)

            puts(colored.blue("Master ip has been updated from {0} to {1}".format(declared_master_ip, master_ip)))
            change = True
        else:
            puts(colored.blue("Master is good"))

        # Check if sahara is available
        minion_path = self.parent.config['minions'][project_name]
        try:
            plugins = Vagrant(minion_path).plugin_list()
        except Exception as e:
            raise

        sahara = bool([p for p in plugins if p.name == "sahara"])

        if not sahara:
            message = "Sandbox support is not available, please install sahara"\
                      " plugin with 'vagrant plugin install sahara'"
            puts(colored.yellow(message))
        else:
            sandbox = SandboxVagrant(minion_path, quiet_stdout=False, quiet_stderr=False)
            sandbox_status = sandbox.sandbox_status()

            if sandbox_status == 'on':
                puts(colored.blue("Snapshot is already enabled on VM"))
                if change:
                    puts(colored.blue("Minion config has changes, would you like to redo the snapshot? It will save the VM in its current state"))
                    choice = bool_choice("Yes/No: ")
                    if choice:
                        sandbox.sandbox_commit()
            else:
                puts(colored.blue("Would you like to enable snapshot on VM?"))
                choice = bool_choice("Yes/No: ")

                if choice:
                    puts(colored.blue("Starting snapshot"))
                    sandbox.sandbox_on()
                    puts(colored.blue("Done"))


@SaltPad.subcommand("halt")
class VagrantHalt(cli.Application, VagrantManagerMixin):

    def main(self, project_name):
        self.execute_vagrant_command_on_minion(project_name, 'halt')


@SaltPad.subcommand("destroy")
class VagrantDestroy(cli.Application, VagrantManagerMixin):

    def main(self, project_name):
        self.execute_vagrant_command_on_minion(project_name, 'destroy')


@SaltPad.subcommand("provision")
class VagrantProvision(cli.Application, VagrantManagerMixin):

    def main(self, project_name):
        self.execute_vagrant_command_on_minion(project_name, 'provision')


@SaltPad.subcommand("ssh")
class VagrantSSH(cli.Application):

    def main(self, project_name):
        minion_path = self.parent.config['minions'][project_name]
        with local.cwd(minion_path):
            call('vagrant ssh')


@SaltPad.subcommand("deploy")
class Deploy(BaseDeploy):

    clean = cli.Flag("--clean", default=False, help="Clean VM before deploying it")
    force_clean = cli.Flag("--force-clean", default=False, help="Force destroy VM")

    def do_clean(self, project_name):
        minion_path = self.parent.config['minions'][project_name]

        # Check if sahara is available
        minion_path = self.parent.config['minions'][project_name]
        try:
            plugins = Vagrant(minion_path).plugin_list()
        except Exception as e:
            raise

        sahara = bool([p for p in plugins if p.name == "sahara"])

        # Check sandbox status
        sandbox_status = 'off'
        if sahara:
            sandbox = SandboxVagrant(minion_path)
            sandbox_status = sandbox.sandbox_status()

        # If sandbox is activated, rollback only
        if sandbox_status == 'on' and not self.force_clean:
            message = "Rollback snapshot, if you will delete snapshot, use "\
                      "--force-clean option"
            puts(colored.blue(message))
            sandbox.sandbox_rollback()
            puts(colored.blue("Done"))

            command = "sudo /etc/init.d/salt-minion restart"
            result = get_output_cmd(command, minion_path)

            puts(colored.blue("Restarted salt-minion"))

            puts(colored.blue("Wait some time for salt-minion to connect"))
            sleep(10)
        # Else destroy and up
        else:
            # Destroy
            VagrantDestroy.parent = self.parent
            VagrantDestroy.run(['destroy', project_name], exit=False)

            # Up
            VagrantUp.parent = self.parent
            VagrantUp.run(['up', project_name], exit=False)

    def main(self, project_name):
        # Clean
        if self.clean or self.force_clean:
            self.do_clean(project_name)

        super(Deploy, self).main(project_name)



def main():
    SaltPad.run()


if __name__ == '__main__':
    main()
