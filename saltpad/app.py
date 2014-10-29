from flask import Flask, redirect, render_template, url_for, session, request, flash
from core import HTTPSaltStackClient, ExpiredToken
from functools import wraps
from utils import login_url, parse_highstate, NotHighstateOutput

# Init app

class FlaskHTTPSaltStackClient(HTTPSaltStackClient):

    def get_token(self):
        return session.get('user_token')


app = Flask("SaltPad", template_folder="templates")
app.secret_key = 'MyVerySecretKey'
client = FlaskHTTPSaltStackClient('http://localhost:8000/')

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

@app.route('/', methods=["GET", "POST"])
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


@app.route("/dashboard")
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
    return render_template('dashboard.html', minions=minions,
        ok_status=sync_number)

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

    return render_template('minions.html', minions=minions, jobs=jobs)

@app.route("/minions/<minion>/do_check_sync")
@login_required
def minions_do_check_sync(minion):
    jid = client.run(minion, 'state.highstate', test=True)['return'][0]['jid']
    return redirect(url_for('job_result', minion=minion, jid=jid, renderer='highstate'))

@app.route("/jobs")
@login_required
def jobs():
    jobs = client.jobs()
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


@app.route("/deployments")
@login_required
def deployments():
    return ""


from flask_wtf import Form
from wtforms import StringField
from wtforms.validators import DataRequired

class RunForm(Form):
    tgt = StringField('target', validators=[DataRequired()])
    fun = StringField('function', validators=[DataRequired()])
    arg = StringField('arg')


@app.route('/run', methods=["GET", "POST"])
@login_required
def run():
    form = RunForm()
    if form.validate_on_submit():
        jid = client.run(form.tgt.data.strip(), form.fun.data.strip(), form.arg.data.strip())['return'][0]['jid']
        return redirect(url_for('job_result', jid=jid))
    return render_template("run.html", form=form)


if __name__ == "__main__":
    print "Start ?"
    app.debug = True
    app.run()
