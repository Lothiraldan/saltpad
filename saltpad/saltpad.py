#!/usr/bin/env python
# -*- coding: utf-8 -*-

import sys
import json

from salt.output.highstate import _format_host

from core import SaltStackClient

from plumbum import cli, local, FG
from clint.eng import join as eng_join
from clint.textui import colored, puts, indent
from os.path import expanduser, isfile
from distutils.util import strtobool


def parse_step_name(step_name):
    splitted = step_name.replace('_|', '|').replace('|-', '|').split('|')
    return "{0}.{3}: '{2}' [id '{1}']:".format(*splitted)


def return_output(cmd):
    base_cmd = local
    for part in cmd:
        base_cmd = base_cmd[part]
    return base_cmd()


def call(cmd):
    base_cmd = local
    for part in cmd.split():
        if '$' in part:
            part = local.env[part.replace('$', '')]
            for subpart in part.split():
                base_cmd = base_cmd[subpart]
        else:
            base_cmd = base_cmd[part]
    # Execute cmd in FG with tty redirection, ignore exit code
    base_cmd & FG(None)


def bool_choice(message):
    try:
        return strtobool(raw_input(message).lower())
    except ValueError:
        return 0


def parse_result(result):
    success = 0
    failure = 0
    changes = 0
    dependencies = 0
    if not isinstance(result, dict):
        puts(colored.red(result[0]))
        return

    for step_name, step in result.iteritems():
        if isinstance(step, list):
            puts(colored.red(step[0]))
            return
        if step.get('result'):
            if step['result']:
                success += 1
            if step['changes']:
                changes += 1
                pass
                # format_result(step_name, step, colored.blue)
        else:
            failure += 1
            if step['comment'] == 'One or more requisite failed':
                dependencies += 1
            else:
                pass
                # format_result(step_name, step, colored.red)
    total = success + failure

    if not failure:
        puts(colored.green("All {0} step OK, {1} changes".format(total, changes)))
        return True
    else:
        puts(colored.red("{0} steps, {1} failures, {4} dependencies failed, {2} OK, {3} changes".format(
            total, failure, success, changes, dependencies)))
        return False


class SaltPad(cli.Application):
    VERSION = "0.0.1"

    def __init__(self, *args, **kwargs):
        super(SaltPad, self).__init__(*args, **kwargs)
        self.config_file = expanduser("~/.saltpad.json")

        if isfile(self.config_file):
            with open(self.config_file) as f:
                self.config = json.load(f)
        else:
            self.config = {}

        self.client = SaltStackClient()

    def main(self, *args):
        if args:
            print "Unknown command %r" % (args[0],)
            return 1   # error exit code
        if not self.nested_command:           # will be ``None`` if no sub-command follows
            print "No command given"
            self.help()
            return 1   # error exit code

    def write_config_file(self):
        with open(self.config_file, 'w') as f:
            json.dump(self.config, f)


@SaltPad.subcommand("deploy")
class Deploy(cli.Application):

    def main(self, project_name):
        # Deploy
        minions = self.parent.client.cmd(project_name, 'test.ping')

        if len(minions) == 0:
            puts(colored.red("No up minions matching, abort!"))
            sys.exit(1)

        bad_minions = []
        for minion, minion_status in minions.items():
            if not minion_status:
                bad_minions.append((minion, minion_status))
        if bad_minions:
            puts(colored.red("Could not deploy on theses minions statuses:"))
            with indent(2):
                for minion_tuple in bad_minions:
                    puts(colored.red('* %s status: %s' %  minion_tuple))

        puts(colored.blue("Starting deployment on %s" % eng_join(minions.keys(), im_a_moron=True)))

        for minion in minions:
            puts(colored.blue("=" * 10))
            puts(colored.blue("Minion: %s" % minion))
            puts(colored.blue("Roles: %s" % eng_join(self.parent.client.minions_roles()[minion], im_a_moron=True)))

            puts()
            puts(colored.blue("Execute state.highstate"))

            result = self.parent.client.cmd(minion, 'state.highstate',
                timeout=9999999999)[minion]
            x = _format_host(minion, result)
            print x[0]
            success = parse_result(result)

            if not success:
                puts()
                puts(colored.red("Deployment has failed on %s minion, abort!"
                                 % minion))
                sys.exit(1)

            # Do orchestration
            # orchestration_result = self.parent.client.orchestrate(minion)
            # print "orchestration_result", orchestration_result

            # Call health-checks
            puts(colored.blue("Starting healthchecks on %s" % minion))
            health_checks_result = self.parent.client.cmd(minion,
                    'state.top', 9999999999, 'healthcheck_top.sls')[minion]
            x = _format_host(minion, health_checks_result)
            print x[0]
            success = parse_result(health_checks_result)

            if not success:
                puts()
                puts(colored.red("Healthchecks has failed on minion %s"
                                 % minion))
                sys.exit(1)
            else:
                puts()
                puts(colored.green("Healthchecks success on minion %s"
                                   % minion))

        puts()
        puts(colored.green("Deployment success on all minions!"))

    def parse_result(self, result):
        success = 0
        failure = 0
        changes = 0
        dependencies = 0
        if not isinstance(result, dict):
            puts(colored.red(result[0]))
            return

        for step_name, step in result.iteritems():
            if isinstance(step, list):
                puts(colored.red(step[0]))
                return
            if step.get('result'):
                if step['result']:
                    success += 1
                if step['changes']:
                    changes += 1
                    pass
                    # self.format_result(step_name, step, colored.blue)
            else:
                failure += 1
                if step['comment'] == 'One or more requisite failed':
                    dependencies += 1
                else:
                    pass
                    # self.format_result(step_name, step, colored.red)
        total = success + failure

        if not failure:
            puts(colored.green("All {0} step OK, {1} changes".format(total, changes)))
            return True
        else:
            puts(colored.red("{0} steps, {1} failures, {4} dependencies failed, {2} OK, {3} changes".format(
                total, failure, success, changes, dependencies)))
            return False

@SaltPad.subcommand("healthchecks")
class Healthchecks(cli.Application):
    """Run healthchecks on minions matching target
    """

    def main(self, target):
        minions = self.parent.client.cmd(target, 'test.ping')

        if len(minions) == 0:
            puts(colored.red("No up minions matching, abort!"))
            sys.exit(1)

        for minion in minions:
            puts(colored.blue("=" * 10))
            puts(colored.blue("Minion: %s" % minion))

            puts(colored.blue("Starting healthchecks on %s" % minion))
            health_checks_result = self.parent.client.cmd(minion,
                    'state.top', 9999999999, 'healthcheck_top.sls')[minion]
            x = _format_host(minion, health_checks_result)
            print x[0]
            success = parse_result(health_checks_result)

            if not success:
                puts()
                puts(colored.red("Healthchecks has failed on minion %s"
                                 % minion))
            else:
                puts()
                puts(colored.green("Healthchecks success on minion %s"
                                   % minion))


def main():
    SaltPad.run()


if __name__ == '__main__':
    main()
