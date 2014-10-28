import os
import sys
import json
import requests

from urlparse import urljoin
from functools import wraps

from utils import get_job_level, get_job_human_status, format_arg


class ExpiredToken(Exception):
    pass


def transform_arguments(job_arguments):
    arguments = [], {}

    for argument in job_arguments:
        if isinstance(argument, dict):
            arguments[1].update(argument)
        else:
            arguments[0].append(argument)

    return arguments


class SaltStackClient(object):

    def __init__(self, remote_host):
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


class HTTPSaltStackClient(object):

    def __init__(self, api_endpoint):
        self.endpoint = api_endpoint
        self.session = requests.Session()

    def urljoin(self, *parts):
        return urljoin(self.endpoint, '/'.join(parts))

    def login(self, user, password):
        headers = {'accept': 'application/json',
            'content-type': 'application/json'}
        data = {'username': user, 'password': password, 'eauth': 'pam'}
        r = self.session.post(self.urljoin('login'), data=json.dumps(data),
            headers=headers, verify=False)
        if r.status_code != 200:
            return None
        return r.json()['return'][0]['token']

    def minions(self, minion_id=None):
        token = self.get_token()
        headers = {'accept': 'application/json', 'X-Auth-Token': token}
        r = self.session.get(self.urljoin('minions'), headers=headers)
        if r.status_code != 200:
            raise Exception()
        return r.json()['return'][0]

    def minions(self):
        token = self.get_token()
        headers = {'accept': 'application/json', 'X-Auth-Token': token}
        r = self.session.get(self.urljoin('minions'), headers=headers)
        return r.json()['return'][0]

    def minions_status(self):
        token = self.get_token()
        data = [{
            "client": "runner",
            "fun": "manage.status",
            "arg": [False],
        }]
        headers = {'accept': 'application/json', 'X-Auth-Token': token,
            'content-type': 'application/json'}
        r = self.session.post(self.endpoint, data=json.dumps(data),
            headers=headers)
        if r.json().get('status'):
            raise ExpiredToken()
        return r.json()['return'][0]

    def jobs(self):
        token = self.get_token()
        headers = {'accept': 'application/json', 'X-Auth-Token': token}
        r = self.session.get(self.urljoin('jobs'), headers=headers)
        return r.json()['return'][0]

    def job(self, jid, minion=None):
        token = self.get_token()
        headers = {'accept': 'application/json', 'X-Auth-Token': token}
        r = self.session.get(self.urljoin('jobs', jid), headers=headers)
        if minion:
            base = r.json()
            output = {'return': base['return'][0][minion]}
            output.update(base['info'][0])
            return output
        return r.json()

    def select_jobs(self, fun, minions=None, with_details=False, **arguments):
        jobs = {}

        for jid, job in self.jobs().iteritems():
            print "Job", job
            if job['Function'] != fun:
                print "Break fun"
                continue

            job_args_args, job_args_kwargs = transform_arguments(job['Arguments'])

            match = True
            for argument, argument_value in arguments.items():

                if job_args_kwargs.get(argument) != argument_value:
                    print "Break arg", job_args_kwargs, argument, job_args_kwargs.get(argument), argument_value
                    match = False
                    break

            if not match:
                continue

            if minions or with_details:
                job_details = self.job(jid)['return'][0]

                # print "Job details", job_details

                for minion_name, minion_return in job_details.iteritems():
                    if not minion_name in minions:
                        continue

                    minion_data = {'details': job,
                        'return': minion_return}

                    if with_details and isinstance(minion_return, dict):
                        minion_data['level'] = get_job_level(minion_return)
                        minion_data['status'] = get_job_human_status(minion_data['level'])
                    else:
                        minion_data['level'] = False
                        minion_data['status'] = 'error'

                    jobs.setdefault(minion_name, {})[jid] = minion_data
            else:
                jobs.setdefault('*', {})[jid] = job

        return jobs

    def run(self, tgt, fun, *args, **kwargs):
        token = self.get_token()
        data = [{
            "client": "local",
            "fun": fun,
            "tgt": tgt,
            "arg": format_arg(args, kwargs),
        }]
        headers = {'accept': 'application/json', 'X-Auth-Token': token,
            'content-type': 'application/json'}
        r = self.session.post(self.endpoint, data=json.dumps(data),
            headers=headers)
        if r.json().get('status'):
            raise ExpiredToken()
        return r.json()

