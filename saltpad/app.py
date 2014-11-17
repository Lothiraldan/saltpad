from flask import Flask, redirect, render_template, url_for, session, request, flash, jsonify
from core import HTTPSaltStackClient, ExpiredToken, Unauthorized
from functools import wraps
from utils import login_url, parse_highstate, NotHighstateOutput, parse_argspec, format_arg, format_arguments, Call

# Init app

class FlaskHTTPSaltStackClient(HTTPSaltStackClient):

    def get_token(self):
        return session.get('user_token')


app = Flask("SaltPad", template_folder="templates")
app.config.from_object('settings')

# Setup logging
if not app.debug:
    from logging import FileHandler
    app.logger.addHandler(FileHandler(app.config['LOG_FILE']))

client = FlaskHTTPSaltStackClient(app.config['API_URL'])

from flask_wtf import Form
from wtforms import StringField, PasswordField, TextAreaField
from wtforms.validators import DataRequired

class LoginForm(Form):
    username = StringField('username', validators=[DataRequired()])
    password = PasswordField('password', validators=[DataRequired()])


def login_required(view):
    @wraps(view)
    def wrapper(*args, **kwargs):
        if not session.get('user_token'):
            return redirect(login_url('login', request.url))

        try:
            return view(*args, **kwargs)
        except (ExpiredToken, Unauthorized):
            return redirect(login_url('login', request.url))

    return wrapper

@app.route('/login', methods=["GET", "POST"])
def login():
    form = LoginForm()
    if form.validate_on_submit():
        try:
            user_token = client.login(form['username'].data, form['password'].data)
            session['username'] = form['username'].data
            session['user_token'] = user_token
            flash('Hi {}'.format(form['username'].data))
            return redirect(request.args.get("next") or url_for("index"))
        except Unauthorized:
            flash('Invalid credentials', 'error')

    return render_template("login.html", form=form)

@app.route('/logout', methods=["GET"])
def logout():
    session.clear()
    flash('Bye!')
    return redirect(url_for('login'))


@app.route("/")
@login_required
def index():
    minions = client.minions_status()
    sync_status = {}
    sync_number = 0
    # for minion in (minions['up'] + minions['down']):
    #     status = get_latest_job_status(client.get_multiple_job_status(minion,
    #         "state_hightest_test", max=2))
    #     if status == 'success':
    #         ok_status += 1
    for minion in minions['up']:
        if sync_status.get(minion) is True:
            sync_number += 1

    jobs = sorted(client.jobs().items(), reverse=True)[:10]

    return render_template('dashboard.html', minions=minions,
        ok_status=sync_number, jobs=jobs)

@app.route("/minions")
@login_required
def minions_status():
    minions = client.minions()
    minions_status = client.minions_status()

    for minion in minions_status['up']:
        minions.setdefault(minion, {})['state'] = 'up'

    for minion in minions_status['down']:
        minions.setdefault(minion, {})['state'] = 'down'

    jobs = client.select_jobs('state.highstate', minions, with_details=True,
        test=True, default_arguments_values={'test': False})

    return render_template('minions.html', minions=minions, jobs=jobs)

@app.route("/minions_deployments")
@login_required
def minions_deployments():
    minions = client.minions()
    minions_status = client.minions_status()

    for minion in minions_status['up']:
        minions.setdefault(minion, {})['state'] = 'up'

    for minion in minions_status['down']:
        minions.setdefault(minion, {})['state'] = 'down'

    jobs = client.select_jobs('state.highstate', minions, with_details=True,
        test=False, default_arguments_values={'test': False})

    return render_template('minions_deployments.html', minions=minions, jobs=jobs)


@app.route("/minions/<minion>/do_deploy")
@login_required
def minions_do_deploy(minion):
    jid = client.run('state.highstate', client="local_async",
        tgt=minion)['jid']
    return redirect(url_for('job_result', minion=minion, jid=jid, renderer='highstate'))


@app.route("/minions/<minion>/do_check_sync")
@login_required
def minions_do_check_sync(minion):
    jid = client.run('state.highstate', client="local_async",
        tgt=minion, args=Call(test=True))['jid']
    return redirect(url_for('job_result', minion=minion, jid=jid, renderer='highstate'))

@app.route("/jobs")
@login_required
def jobs():
    jobs = sorted(client.jobs().items(), reverse=True)
    return render_template('jobs.html', jobs=jobs)

@app.route("/job_result/<jid>")
@login_required
def job_result(jid):
    minion = request.args.get('minion', None)
    renderer = request.args.get('renderer', 'raw')
    job = client.job(jid)

    if renderer == 'highstate':
        try:
            job = parse_highstate(job)
        except NotHighstateOutput:
            return redirect(url_for('job_result', jid=jid, minion=minion,
                renderer='raw'))
    elif renderer == 'aggregate':
        aggregate_result = {}

        for minion, minion_return in job['return'].iteritems():
            aggregate_result.setdefault(str(minion_return), []).append(minion)

        missing_minions = set(job['info']['Minions']) - set(job['return'].iterkeys())
        if missing_minions:
            aggregate_result['Missing results'] = missing_minions
        job['return'] = aggregate_result

    if not job:
        return "Unknown jid", 404
    return render_template('job_result_{}.html'.format(renderer), job=job, minion=minion,
        renderer=renderer)

@app.route("/templates")
@login_required
def templates():
    master_config = client.run('config.values', client="wheel")['data']['return']
    if not master_config.get('templates'):
        client.run('config.apply', client="wheel", key="templates", value={})
        master_config['templates'] = {}
    return render_template("templates.html", templates=master_config['templates'])

@app.route("/templates/run/<template>")
@login_required
def run_template(template):
    master_config = client.run('config.values', client="wheel")['data']['return']
    template_data = master_config['templates'].get(template)

    if not template_data:
        return "Unknown template", 404

    jid = client.run(template_data['fun'], client="local_async",
        tgt=template_data['tgt'], expr_form=template_data['expr_form'],
        args=Call(**template_data['args']))['jid']

    return redirect(url_for('job_result', jid=jid))

@app.route("/templates/new", methods=['GET', 'POST'])
@login_required
def add_template():
    form = NewTemplateForm()
    if form.validate_on_submit():
        master_config = client.run('config.values', client="wheel")['data']['return']


        args = {k: v for (k, v) in request.form.iteritems() if not k in
            ('csrf_token', 'tgt', 'fun', 'expr_form', 'name', 'description') and v}

        templates = master_config.get('templates', {})
        templates[form.name.data.strip()] = {
            'description': form.description.data.strip(),
            'fun': form.fun.data.strip(),
            'tgt': form.tgt.data.strip(),
            'expr_form': form.expr_form.data.strip(),
            'args': args}

        client.run('config.apply', client="wheel", key="templates", value=templates)

        master_config = client.run('config.values', client="wheel")

        flash('Template {} has been successfully saved'.format(form.name.data.strip()))

        return redirect(url_for('templates'))
    return render_template("add_template.html", form=form)


@app.route("/deployments")
@login_required
def deployments():
    return ""


from flask_wtf import Form
from wtforms import StringField, SelectField
from wtforms.validators import DataRequired

matchers = [
    ('glob', 'Glob'),
    ('pcre', 'Perl regular expression'),
    ('list', 'List'),
    ('grain', 'Grain'),
    ('grain_pcre', 'Grain perl regex'),
    ('pillar', 'Pillar'),
    ('nodegroup', 'Nodegroup'),
    ('range', 'Range'),
    ('compound', 'Compound')
]

class RunForm(Form):
    expr_form = SelectField('matcher', choices=matchers)
    tgt = StringField('target', validators=[DataRequired()])
    fun = StringField('function', validators=[DataRequired()])

class NewTemplateForm(RunForm):
    name = StringField('name', validators=[DataRequired()])
    description = TextAreaField('description', validators=[DataRequired()])


@app.route('/run', methods=["GET", "POST"])
@login_required
def run():
    form = RunForm()
    if form.validate_on_submit():

        args = {k: v for (k, v) in request.form.iteritems() if not k in ('csrf_token', 'tgt', 'fun', 'expr_form') and v}

        jid = client.run(form.fun.data.strip(), client="local_async",
            tgt=form.tgt.data.strip(), expr_form=form.expr_form.data.strip(),
            args=Call(**args))['jid']

        return redirect(url_for('job_result', jid=jid))
    return render_template("run.html", form=form)


@app.route("/job/redo/<jid>")
@login_required
def redo_job(jid):
    minion = request.args.get('minion', None)
    renderer = request.args.get('renderer', 'raw')
    job = client.job(jid)

    if not job:
        return "Unknown jid", 404

    jid = client.run(job['info']['Function'], client="local_async",
        tgt=job['info']['Target'], expr_form=job['info']['Target-type'],
        args=job['info']['Arguments'])['jid']

    return redirect(url_for('job_result', minion=minion, jid=jid,
        renderer='highstate'))


@app.route('/doc_search', methods=["POST", "OPTIONS"])
@login_required
def doc_search():
    content = request.json

    arg_specs = client.run('sys.argspec', client='local',
        tgt=content['tgt'].strip(), expr_form=content['expr_form'],
        args=Call(content['fun'].strip()))

    if not arg_specs:
        return jsonify({'error': 'No minions up ?'})

    # Take only first result
    arg_specs = arg_specs.values()[0]

    module_function_names = arg_specs.keys()

    docs = client.run('sys.doc', client='local', tgt=content['tgt'].strip(),
        expr_form=content['expr_form'], args=Call(*module_function_names))

    # Take only first result
    docs = docs.values()[0]

    result = {}

    for module_function_name in module_function_names:
        result[module_function_name] = {
            'spec': parse_argspec(arg_specs[module_function_name]),
            'doc': docs[module_function_name]}

    return jsonify(result)


@app.route('/minions_keys')
@login_required
def minions_keys():
    content = request.json
    minions_keys = client.run('key.list_all', client='wheel')['data']['return']
    return render_template("minions_keys.html", keys=minions_keys)


@app.route('/keys/delete/<key>')
@login_required
def delete_key(key):
    content = request.json
    minions_keys = client.run('key.delete', client="wheel", match=key)['data']['return']
    return redirect(url_for('minions_keys'))


@app.route('/keys/reject/<key>')
@login_required
def reject_key(key):
    content = request.json
    client.run('key.reject', client="wheel", match=key)['data']['return']
    return redirect(url_for('minions_keys'))


@app.route('/keys/accept/<key>')
@login_required
def accept_key(key):
    content = request.json
    client.run('key.accept', client="wheel", match=key)['data']['return']
    return redirect(url_for('minions_keys'))

@app.route('/minion/<minion>')
@login_required
def minion_details(minion):
    minion_details = client.minion_details(minion)
    if not minion_details['return'][0]:
        minion_details['status'] = 'down'
    else:
        minion_details['status'] = 'up'
    minion_details['name'] = minion
    return render_template("minion_details.html", minion_details=minion_details)

@app.route('/debug/')
@login_required
def debug():
    minions = client.minions()
    minions_status = client.minions_status()

    for minion in minions_status['up']:
        minions.setdefault(minion, {})['state'] = 'up'

    for minion in minions_status['down']:
        minions.setdefault(minion, {})['state'] = 'down'

    return render_template('debug.html', minions=minions)

@app.route('/debug/<minion>')
@login_required
def debug_minion(minion):

    pillar_data = client.run("pillar.items", client="local", tgt=minion)[minion]
    # Make a PR for that
    #pillar_top = client.run("pillar.show_top", client="runner", minion=minion)
    state_top = client.run("state.show_top", client="local", tgt=minion)[minion]
    lowstate = client.run("state.show_lowstate", client="local", tgt=minion)[minion]
    grains = client.run("grains.items", client="local", tgt=minion)[minion]

    return render_template('debug_minion.html', minion=minion,
        pillar_data=pillar_data, state_top=state_top, lowstate=lowstate,
        grains=grains)

@app.route('/wip')
@login_required
def wip():
    return render_template("wip.html")


@app.template_filter("aggregate_len_sort")
def aggregate_len_sort(unsorted_dict):
    return sorted(unsorted_dict.iteritems(), key=lambda x: len(x[1]),
        reverse=True)

@app.template_filter("format_arguments")
def format_argument(arguments):
    return " ".join(format_arguments(arguments))


if __name__ == "__main__":
    app.debug = True
    app.run()
