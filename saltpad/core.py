import os
import sys
import json
import requests

from urlparse import urljoin
from functools import wraps
from itertools import chain
from itertools import izip

from utils import get_job_level, get_job_human_status, format_arg, transform_arguments, Call


class ExpiredToken(Exception):
    pass


class Unauthorized(Exception):
    pass


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


class HTTPSaltStackSession(requests.Session):

    def request(self, *args, **kwargs):
        response = super(HTTPSaltStackSession, self).request(*args, **kwargs)

        if response.status_code == 401:
            raise Unauthorized()

        response.raise_for_status()

        json_response = response.json()

        if 'status' in json_response and json_response['return'] == 'Please log in':
            raise ExpiredToken()


        return json_response


class HTTPSaltStackClient(object):

    def __init__(self, api_endpoint):
        self.endpoint = api_endpoint
        self.session = HTTPSaltStackSession()

    def urljoin(self, *parts):
        return urljoin(self.endpoint, '/'.join(parts))

    def login(self, user, password):
        headers = {'accept': 'application/json',
            'content-type': 'application/json'}
        data = {'username': user, 'password': password, 'eauth': 'pam'}
        return self.session.post(self.urljoin('login'), data=json.dumps(data),
            headers=headers, verify=False)['return'][0]['token']

    def minions(self):
        token = self.get_token()
        headers = {'accept': 'application/json', 'X-Auth-Token': token}
        r = self.session.get(self.urljoin('minions'), headers=headers, verify=False)
        return r['return'][0]

    def minion_details(self, minion):
        token = self.get_token()
        headers = {'accept': 'application/json', 'X-Auth-Token': token}
        return self.session.get(self.urljoin('minions', minion), headers=headers, verify=False)

    def minions_status(self):
        return self.run("manage.status", client="runner")

    def jobs(self, minion=None):
        token = self.get_token()
        headers = {'accept': 'application/json', 'X-Auth-Token': token}
        r = self.session.get(self.urljoin('jobs'), headers=headers, verify=False)

        return r['return'][0]

    def job(self, jid, minion=None):
        token = self.get_token()
        headers = {'accept': 'application/json', 'X-Auth-Token': token}
        r = self.session.get(self.urljoin('jobs', jid), headers=headers, verify=False)

        if not r['return'][0]:
            output = {'status': 'running', 'info': r['info'][0]}
            return output

        # Only filter minion
        if minion:
            minion_return = r['return'][0][minion]
            output = {'return': minion_return, 'info': r['info']}

            return output

        return {'info': r['info'][0], 'return': r['return'][0]}

    def jobs_batch(self, jobs):
        token = self.get_token()

        data = [{"fun": "jobs.lookup_jid", "jid": jid, "client": 'runner'}
            for jid in jobs]

        # raise Exception(data)

        headers = {'accept': 'application/json', 'X-Auth-Token': token,
            'content-type': 'application/json'}
        r = self.session.post(self.endpoint, data=json.dumps(data),
            headers=headers, verify=False)
        for jid, job_return in izip(jobs, r['return']):
            jobs[jid]['return'] = job_return
        return jobs


    def select_jobs(self, fun, minions=None, with_details=False, **arguments):
        jobs = {}

        default_arguments_values = arguments.pop('default_arguments_values', {})

        jids = {}

        # Pre-match
        for jid, job in self.jobs().iteritems():
            if job['Function'] != fun:
                continue

            _, job_args_kwargs = transform_arguments(job['Arguments'])

            match = True
            for argument, argument_value in arguments.items():

                default_argument_value = default_arguments_values.get(argument)

                if job_args_kwargs.get(argument, default_argument_value) != argument_value:
                    match = False
                    break

            if not match:
                continue

            jids[jid] = job

            if not (minions or with_details):
                jobs.setdefault('*', {})[jid] = job


        # Get each job detail if needed
        if minions or with_details:
            job_returns = self.jobs_batch(jids)

            # raise Exception(jobs)

            for jid, job_details in job_returns.iteritems():

                # Running job
                if job_details.get('status') == 'running':
                    for minion_name in job_details['info']['Minions']:
                        minion_data = job_details
                        jobs.setdefault(minion_name, {})[jid] = minion_data
                    continue

                job_return = job_details['return']

                for minion_name, minion_return in job_return.iteritems():
                    if not minion_name in minions:
                        continue

                    # Error has been detected
                    if isinstance(minion_return, list):

                        minion_data = {'return': minion_return,
                            'status': 'error', 'info': job}
                        jobs.setdefault(minion_name, {})[jid] = minion_data
                        continue

                    minion_data = {'return': minion_return, 'info': job}

                    if with_details and isinstance(minion_return, dict):
                        minion_data['level'] = get_job_level(minion_return)
                        minion_data['status'] = get_job_human_status(minion_data['level'])
                    else:
                        minion_data['level'] = False
                        minion_data['status'] = 'error'

                    jobs.setdefault(minion_name, {})[jid] = minion_data


        return jobs

    def run(self, fun, tgt=None, expr_form=None, client=None, args=[], **kwargs):
        token = self.get_token()
        data = [{
            "fun": fun,
            "arg": args,
        }]

        if tgt:
            data[0]['tgt'] = tgt

        if expr_form:
            data[0]['expr_form'] = expr_form

        if client:
            data[0]['client'] = client

        data[0].update(kwargs)

        headers = {'accept': 'application/json', 'X-Auth-Token': token,
            'content-type': 'application/json'}
        r = self.session.post(self.endpoint, data=json.dumps(data),
            headers=headers, verify=False)
        return r['return'][0]

