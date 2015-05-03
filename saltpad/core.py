import json
import requests

from requests.exceptions import ConnectionError
from urlparse import urljoin
from itertools import izip
from flask import current_app
from utils import get_job_level, get_job_human_status, transform_arguments


class ExpiredToken(Exception):
    pass


class Unauthorized(Exception):
    pass


class InvalidURI(Exception):
    pass


class HTTPSaltStackSession(requests.Session):

    def get_token(self):
        """
        Will be overridden.
        """

    def request(self, method, url, **kwargs):
        try:
            response = super(HTTPSaltStackSession, self).request(method, url, **kwargs)
        except ConnectionError as e:
            err_msg = "Could not connect to salt-api at URL '%s': %s"
            raise InvalidURI(err_msg % (url, repr(e)))

        if response.status_code == 401:
            raise Unauthorized()

        response.raise_for_status()

        json_response = response.json()

        if 'status' in json_response and json_response['return'] == 'Please log in':
            raise ExpiredToken()

        return json_response


class HTTPSaltStackClient(object):

    def __init__(self, api_endpoint, verify_ssl=True):
        self.endpoint = api_endpoint
        self.session = HTTPSaltStackSession()
        self.verify_ssl = verify_ssl

    def urljoin(self, *parts):
        return urljoin(self.endpoint, '/'.join(parts))

    def login(self, user, password):
        headers = {'accept': 'application/json'}
        data = {'username': user, 'password': password, 'eauth': current_app.config['EAUTH']}
        return self.session.post(self.urljoin('login'), data=data,
            headers=headers, verify=self.verify_ssl)['return'][0]

    def minions(self):
        token = self.get_token()
        headers = {'accept': 'application/json', 'X-Auth-Token': token}
        r = self.session.get(self.urljoin('minions'), headers=headers, verify=self.verify_ssl)
        return r['return'][0]

    def minion_details(self, minion):
        token = self.get_token()
        headers = {'accept': 'application/json', 'X-Auth-Token': token}
        return self.session.get(self.urljoin('minions', minion), headers=headers, verify=self.verify_ssl)

    def minions_status(self):
        return self.run("manage.status", client="runner")

    def jobs(self, minion=None):
        token = self.get_token()
        headers = {'accept': 'application/json', 'X-Auth-Token': token}
        r = self.session.get(self.urljoin('jobs'), headers=headers, verify=self.verify_ssl)

        return r['return'][0]

    def job(self, jid, minion=None):
        token = self.get_token()
        headers = {'accept': 'application/json', 'X-Auth-Token': token}
        r = self.session.get(self.urljoin('jobs', jid), headers=headers, verify=self.verify_ssl)

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

        headers = {'accept': 'application/json', 'X-Auth-Token': token,
            'content-type': 'application/json'}
        r = self.session.post(self.endpoint, data=json.dumps(data),
            headers=headers, verify=self.verify_ssl)
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
            headers=headers, verify=self.verify_ssl)
        return r['return'][0]
