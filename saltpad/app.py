from flask import Flask, redirect, render_template, url_for, session, request, flash, jsonify
from core import HTTPSaltStackClient, ExpiredToken
from functools import wraps
from utils import login_url, parse_highstate, NotHighstateOutput, parse_argspec, format_arg

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
from wtforms import StringField, PasswordField
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
        except ExpiredToken:
            return redirect(login_url('login', request.url))

    return wrapper

@app.route('/login', methods=["GET", "POST"])
def login():
    form = LoginForm()
    if form.validate_on_submit():
        user_token = client.login(form['username'].data, form['password'].data)
        if user_token:
            session['username'] = form['username'].data
            session['user_token'] = user_token
            flash('Hi {}'.format(form['username'].data))
            return redirect(request.args.get("next") or url_for("index"))
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
        minions[minion]['state'] = 'up'

    for minion in minions_status['down']:
        minions.setdefault(minion, {})['state'] = 'down'

    jobs = client.select_jobs('state.highstate', minions, with_details=True,
        test=True)

    return render_template('minions.html', minions=minions, jobs=jobs)

@app.route("/minions_deployments")
@login_required
def minions_deployments():
    minions = client.minions()
    minions_status = client.minions_status()

    for minion in minions_status['up']:
        minions[minion]['state'] = 'up'

    for minion in minions_status['down']:
        minions.setdefault(minion, {})['state'] = 'down'

    jobs = client.select_jobs('state.highstate', minions, with_details=True)

    return render_template('minions_deployments.html', minions=minions, jobs=jobs)


@app.route("/minions/<minion>/do_deploy")
@login_required
def minions_do_deploy(minion):
    jid = client.run(minion, 'state.highstate', 'glob')['return'][0]['jid']
    return redirect(url_for('job_result', minion=minion, jid=jid, renderer='highstate'))


@app.route("/minions/<minion>/do_check_sync")
@login_required
def minions_do_check_sync(minion):
    jid = client.run(minion, 'state.highstate', 'glob', test=True)['return'][0]['jid']
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

    if not job:
        return "Unknown jid", 404
    return render_template('job_result.html', job=job, minion=minion,
        renderer=renderer)


@app.route("/job/redo/<jid>")
@login_required
def redo_job(jid):
    minion = request.args.get('minion', None)
    renderer = request.args.get('renderer', 'raw')
    job = client.job(jid)

    if not job:
        return "Unknown jid", 404

    jid = client.run(job['info']['Target'], job['info']['Function'],
            job['info']['Target-type'], *job['info']['Arguments'])['return'][0]['jid']

    return redirect(url_for('job_result', minion=minion, jid=jid,
        renderer='highstate'))



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


@app.route('/run', methods=["GET", "POST"])
@login_required
def run():
    form = RunForm()
    if form.validate_on_submit():

        args = {k: v for (k, v) in request.form.iteritems() if not k in ('csrf_token', 'tgt', 'fun', 'expr_form') and v}

        jid = client.run(form.tgt.data.strip(), form.fun.data.strip(),
            form.expr_form.data.strip(), **args)['return'][0]['jid']
        return redirect(url_for('job_result', jid=jid))
    return render_template("run.html", form=form)

@app.route('/doc_search', methods=["POST", "OPTIONS"])
@login_required
def doc_search():
    content = request.json
    data = [{
        'client': 'local',
        'fun': 'sys.argspec',
        'tgt': content['tgt'].strip(),
        'expr_form': content['expr_form'],
        'arg': [content['fun'].strip()]
    }]
    arg_specs = client.run_sync(data)

    if not arg_specs:
        return jsonify({'error': 'No minions up ?'})

    # Take only first result
    arg_specs = arg_specs.values()[0]

    module_function_names = arg_specs.keys()

    docs_data = [{
        'client': 'local',
        'fun': 'sys.doc',
        'tgt': content['tgt'].strip(),
        'expr_form': content['expr_form'],
        'arg': list(module_function_names)
    }]
    docs = client.run_sync(docs_data)

    # Take only first result
    docs = docs.values()[0]

    result = {}

    for module_function_name in module_function_names:
        result[module_function_name] = {
            'spec': parse_argspec(arg_specs[module_function_name]),
            'doc': docs[module_function_name]}

    return jsonify(result)


@app.route('/keys')
@login_required
def minions_keys():
    content = request.json
    data = [{
        'client': 'wheel',
        'fun': 'key.list_all',
    }]
    minions_keys = client.run_sync(data)['data']['return']
    return render_template("minions_keys.html", keys=minions_keys)


@app.route('/keys/delete/<key>')
@login_required
def delete_key(key):
    content = request.json
    data = [{
        'client': 'wheel',
        'fun': 'key.delete',
        'match': key
    }]
    minions_keys = client.run_sync(data)['data']['return']
    return redirect(url_for('minions_keys'))


@app.route('/keys/reject/<key>')
@login_required
def reject_key(key):
    content = request.json
    data = [{
        'client': 'wheel',
        'fun': 'key.reject',
        'match': key
    }]
    minions_keys = client.run_sync(data)['data']['return']
    return redirect(url_for('minions_keys'))


@app.route('/keys/accept/<key>')
@login_required
def accept_key(key):
    content = request.json
    data = [{
        'client': 'wheel',
        'fun': 'key.accept',
        'match': key
    }]
    minions_keys = client.run_sync(data)
    return redirect(url_for('minions_keys'))


if __name__ == "__main__":
    print "Start ?"
    app.debug = True
    app.run()
