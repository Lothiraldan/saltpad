import sys

from flask import url_for
from werkzeug.urls import url_decode, url_encode
from flask import render_template_string, request

from six.moves.urllib.parse import urlparse, urlunparse
from six import string_types


REQUIRED_PERMISSIONS = ['.*', '@runner', '@wheel']


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
reverse_statues = dict((v, k) for k, v in list(statuses.items()))
human_status = {False: 'failure', None: 'warning', True: 'success'}


def parse_step_name(step_name):
    splitted = step_name.replace('_|', '|').replace('|-', '|').split('|')
    return "{0}.{3}: \"{2}\"".format(*splitted)


def get_job_level(job_result):
    job_status = 0
    for state in list(job_result.values()):
        job_status = max(job_status, statuses[state['result']])
    job_status = reverse_statues[job_status]
    return job_status


def get_job_human_status(job_level):
    return human_status[job_level]

def format_arg(args):
    return list(args) + [{'__kwarg__': True, kwarg_k: kwarg_v} for
        (kwarg_k, kwarg_v) in list(kwargs.items())]


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

        for minion_name, minion_return in job['return'].items():

            # Error detected
            if isinstance(minion_return, list):
                job['return'][minion_name] = {'status': 'error',
                    'error': '\n'.join(minion_return)}
                continue

            if isinstance(minion_return, string_types):
                job['return'][minion_name] = {'status': 'error',
                    'error': minion_return}
                continue

            new_minion_return = {'steps': {}, 'highstate': {}}

            # Minion return level
            level = 0

            for step_name, step in minion_return.items():

                # Check if step key was returned
                if step['changes']:
                    # Check if step is empty
                    if not step['changes']:
                        step.pop('changes')

                # Support for requirements failed
                if step['result'] is False and "One or more requisite failed" in step['comment']:
                    step['result'] = 'requirement_failed'

                # Job with changes
                if step['result'] is True and step.get('changes'):
                    step['result'] = 'changes'

                # Step
                level = max(level, statuses[step['result']])
                reversed_level = reverse_statues[level]

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

    if not args:
        argspec['required_args'] = []
    else:
        argspec['required_args'] = args[:-len(defaults)]

    if not defaults:
        argspec['defaults_args'] = {}
    else:
        argspec['default_args'] = dict(zip(args[-len(defaults):], defaults))


    return argspec


def format_arguments(arguments):
    for argument in arguments:
        if isinstance(argument, dict):
            argument.pop('__kwarg__')
            yield "--{}={}".format(*list(argument.items())[0])
        else:
            yield argument

def Call(*args, **kwargs):
    return list(args) + [{'__kwarg__': True, kwarg_k: kwarg_v} for
        (kwarg_k, kwarg_v) in kwargs.items()]


GRAPHVIZ_TEMPLATE = """
digraph G {

    {% for state in lowstate -%}
    {{ state['order'] }} [label="{{ state['state'] }} {{ state['fun'] }} : {{ state['__id__'] }}"];
    {% endfor %}

    {% for sls_name in states %}
    subgraph cluster_{{ sls_name|replace('.', '_')|replace('-', '_') }} {
        label = "{{ sls_name }}";
        style=filled;
        color=lightgrey;

        {% for require in states_requires[sls_name] -%}
        {{ require[0] }} -> {{ require[1] }};
        {% endfor %}
    }
    {% endfor %}

    {% for require in requires -%}
    {{ require[0] }} -> {{ require[1] }};
    {% endfor %}

    {% for watch in watchs -%}
    {{ watch[0] }} -> {{ watch[2] }};
    {% endfor %}
}
"""



def process_lowstate(lowstate):
    id_map = {}
    requires = []
    watchs = []
    states = set()
    states_requires = {}
    states_watchs = {}

    for state in lowstate:
        # Generate map id
        id_map[(state['state'], state['__id__'])] = (state['order'], state['__sls__'])
        id_map[(state['state'], state['name'])] = (state['order'], state['__sls__'])

        # Append to states
        states_requires.setdefault(state['__sls__'], [])
        states_watchs.setdefault(state['__sls__'], [])

    for state in lowstate:
        # Add requires and watch
        for require in state.get('require', []):
            require_state, require_name = list(require.items())[0]

            if require_state == 'sls':
                requires.append((state['order'], 'cluster_{}'.format(require_name.replace('.', '_').replace('-', '_'))))
                continue

            required_state = id_map[(require_state, require_name)]

            if required_state[1] == state['__sls__']:
                states.add(state['__sls__'])
                states_requires.setdefault(state['__sls__'], []).append((state['order'], required_state[0]))
            else:
                requires.append((state['order'], required_state[0]))

        # for watch in state.get('watch', []):
        #     watchs.append((state['order'], id_map[list(watch.items())[0]]))

    # Generate dot file
    graph = render_template_string(GRAPHVIZ_TEMPLATE, lowstate=lowstate,
        requires=requires, watchs=watchs, states=states,
        states_requires=states_requires, states_watchs=states_watchs)

    return graph


def validate_permissions(permissions):
    return sorted(permissions) == sorted(REQUIRED_PERMISSIONS)


def get_filtered_post_arguments(arguments_to_exclude):
    args = {}
    for arg_key, arg_value in request.form.items():
        if arg_key not in arguments_to_exclude and arg_value:
            args[arg_key] = arg_value
    return args
