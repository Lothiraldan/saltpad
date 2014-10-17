import os
import sys

import salt.config
import salt.client
import salt.runner
import salt.key

import pymongo

from salt.output import highstate

from functools import wraps


def mproperty(fn):
    attribute = "_memo_%s" % fn.__name__

    @property
    @wraps(fn)
    def _property(self):
        if not hasattr(self, attribute):
            setattr(self, attribute, fn(self))
        return getattr(self, attribute)

    return _property


class SaltStackClient(object):

    def __init__(self, collection_name="saltpad"):
        master_opts = salt.config.master_config(
            os.environ.get('SALT_MASTER_CONFIG', '/etc/salt/master'))

        if not 'color' in master_opts:
            master_opts['color'] = True

        # Inject master_opts
        highstate.__opts__ = master_opts

        minion_opts = salt.config.client_config(
            os.environ.get('SALT_MINION_CONFIG', '/etc/salt/minion'))

        self.local = salt.client.LocalClient()
        self.runner = salt.runner.RunnerClient(master_opts)
        self.key = salt.key.Key(master_opts)

        self.collection_name = collection_name
        self.con = pymongo.MongoClient()
        self.db = self.con[self.collection_name]

        self._minions = None

        self.highstate_cache = {}

    @property
    def minions(self):
        if self._minions is None:
            minions = self.local.cmd('*', 'test.ping', timeout=0)
            keys = self.key.list_keys()
            ret = {}
            ret['up'] = sorted(minions)
            ret['down'] = sorted(set(keys['minions']) - set(minions))
            self._minions = ret
        return self._minions

    def get_minion_status(self, minion_name):
        if minion_name in self.minions["up"]:
            return "up"
        elif minion_name in self.minions["down"]:
            return "down"
        else:
            return "Bad minion_name"

    def _reload_roles(self):
        self._minions_roles = {}
        self._roles_minions = {}

        for minion in self.minions["up"]:
            roles = self.local.cmd(minion, 'grains.get', ['roles'])[minion]
            self._minions_roles[minion] = roles
            for role in roles:
                self._roles_minions.setdefault(role, []).append(minion)

    def minions_roles(self):
        self._reload_roles()
        return self._minions_roles

    def roles_minions(self):
        self._reload_roles()
        return self._roles_minions

    def get_job_id(self, minion, jid):
        return self.con[minion].find_one({'jid': jid})

    def get_multiple_job_status(self, minion, key=None, max=5):
        query = {}
        if key:
            query['key'] = key
        return list(self.db[minion].find(query).sort('_id', -1).limit(max))

    def get_job_status(self, minion, jid, key=None):
        query = {'jid': jid}
        if key:
            query['key'] = key
        return self.db[minion].find_one(query)

    def run_job(self, minion, fun, key=None, *args, **kwargs):
        result = self.local.run_job(minion, fun,
            timeout=99999999999999, ret='mongo_saltpad', arg=args, kwarg=kwargs)
        if key is None:
            key = fun
        self.db[minion].insert({'jid': result['jid'], 'key': key})
        return result['jid']

    def cmd(self, target, fun, timeout=None, *args, **kwargs):
        return self.local.cmd(target, fun, arg=args, timeout=timeout,
            kwarg=kwargs)

    def cmd_iter(self, target, fun, *args, **kwargs):
        return self.local.cmd_iter(target, fun, arg=args, kwarg=kwargs)
