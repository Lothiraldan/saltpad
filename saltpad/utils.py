import sys

from flask import Flask, redirect, render_template, url_for, session, request, flash
from urlparse import urlparse
from werkzeug.urls import url_decode, url_encode

if sys.version < '3':  # pragma: no cover
    from urlparse import urlparse, urlunparse
else:  # pragma: no cover
    from urllib.parse import urlparse, urlunparse
    unicode = str

def make_next_param(login_url, current_url):
    '''
    Reduces the scheme and host from a given URL so it can be passed to
    the given `login` URL more efficiently.

    :param login_url: The login URL being redirected to.
    :type login_url: str
    :param current_url: The URL to reduce.
    :type current_url: str
    '''
    l = urlparse(login_url)
    c = urlparse(current_url)

    if (not l.scheme or l.scheme == c.scheme) and \
            (not l.netloc or l.netloc == c.netloc):
        return urlunparse(('', '', c.path, c.params, c.query, ''))
    return current_url


def login_url(login_view, next_url=None, next_field='next'):
    '''
    Creates a URL for redirecting to a login page. If only `login_view` is
    provided, this will just return the URL for it. If `next_url` is provided,
    however, this will append a ``next=URL`` parameter to the query string
    so that the login view can redirect back to that URL.

    :param login_view: The name of the login view. (Alternately, the actual
                       URL to the login view.)
    :type login_view: str
    :param next_url: The URL to give the login view for redirection.
    :type next_url: str
    :param next_field: What field to store the next URL in. (It defaults to
                       ``next``.)
    :type next_field: str
    '''
    if login_view.startswith(('https://', 'http://', '/')):
        base = login_view
    else:
        base = url_for(login_view)

    if next_url is None:
        return base

    parts = list(urlparse(base))
    md = url_decode(parts[4])
    md[next_field] = make_next_param(base, next_url)
    parts[4] = url_encode(md, sort=True)
    return urlunparse(parts)


statuses = {False: 2, None: 1, True: 0}
reverse_statues = {v:k for k, v in statuses.items()}
human_status = {False: 'error', None: 'warning', True: 'success'}


def parse_step_name(step_name):
    splitted = step_name.replace('_|', '|').replace('|-', '|').split('|')
    return "{0}.{3}: \"{2}\"".format(*splitted)


def get_job_level(job_result):
    job_status = 0
    for state in job_result.values():
        job_status = max(job_status, statuses[state['result']])
    job_status = reverse_statues[job_status]
    return job_status


def get_job_human_status(job_level):
    return human_status[job_level]


def process_job_return(job):
    output = {}
    if job.get('return'):
        for k, v in job['return'].items():
            # Clean v
            result = v.pop('result')
            v.pop('__run_num__')
            if not v['changes']:
                v.pop('changes')
            output.setdefault(result, {})[parse_step_name(k)] = v
    return output


def process_sync_jobs(jobs):
    result = []
    for job in jobs:
        job_result = {'status': 'running'}
        if job.get('return'):
            job_result['level'] = get_job_status(job['return'])
            job_result['status'] = human_status[job_result['level']]
        job_result['date'] = job['_id'].generation_time
        job_result['jid'] = job['jid']
        result.append(job_result)
    return result


def format_arg(args, kwargs):
    return list(args) + [{'__kwarg__': True, kwarg_k: kwarg_v} for
        (kwarg_k, kwarg_v) in kwargs.items()]
