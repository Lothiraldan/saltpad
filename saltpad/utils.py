import sys

from flask import Flask, redirect, render_template, url_for, session, request, flash
from urlparse import urlparse
from werkzeug.urls import url_decode, url_encode
from copy import copy

if sys.version < '3':  # pragma: no cover
    from urlparse import urlparse, urlunparse
else:  # pragma: no cover
    from urllib.parse import urlparse, urlunparse
    unicode = str


class NotHighstateOutput(Exception):
    pass


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
human_status = {False: 'failure', None: 'warning', True: 'success'}


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

def format_arg(args, kwargs):
    return list(args) + [{'__kwarg__': True, kwarg_k: kwarg_v} for
        (kwarg_k, kwarg_v) in kwargs.items()]


def transform_arguments(job_arguments):
    arguments = [], {}

    for argument in job_arguments:
        if isinstance(argument, dict):
            arguments[1].update(argument)
        else:
            arguments[0].append(argument)

    return arguments


def parse_highstate(job):
    # Process return
    new_return = {}
    highstate = {}

    if job['info']['Function'] != 'state.highstate':
        raise NotHighstateOutput()

    if job.get('status') != 'running':

        for minion_name, minion_return in job['return'].iteritems():

            # Error detected
            if isinstance(minion_return, list):
                job['return'][minion_name] = {'status': 'error',
                    'error': minion_return}
                continue

            new_minion_return = {'steps': {}, 'highstate': {}}

            # Minion return level
            level = 0

            for step_name, step in minion_return.iteritems():

                # Step
                level = max(level, statuses[step['result']])
                reversed_level = reverse_statues[level]

                # Filter step
                step.pop('__run_num__')
                if not step['changes']:
                    step.pop('changes')

                new_minion_return['steps'][parse_step_name(step_name)] = step
                new_minion_return['highstate'].setdefault(step['result'], {})[parse_step_name(step_name)] = step

            new_minion_return['level'] = reversed_level
            new_minion_return['status'] = get_job_human_status(reversed_level)

            job['return'][minion_name] = new_minion_return


    return job


def parse_argspec(argspec):
    args = argspec.pop('args')
    defaults = argspec.pop('defaults')

    defaults = defaults if defaults else []

    argspec['required_args'] = args[:-len(defaults)]
    argspec['default_args'] = dict(zip(args[-len(defaults):], defaults))

    return argspec
