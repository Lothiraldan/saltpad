from flask import Flask, redirect, render_template, url_for
app = Flask("SaltPad", template_folder="templates")

from core import SaltStackClient

class groupby(dict):
    def __init__(self, seq, key=lambda x:x):
        for value in seq:
            k = key(value)
            self.setdefault(k, []).append(value)
    __iter__ = dict.iteritems

client = SaltStackClient()
statuses = {False: 2, None: 1, True: 0}
reverse_statues = {v:k for k, v in statuses.items()}
human_status = {False: 'warning', None: 'warning', True: 'success'}


def parse_step_name(step_name):
    splitted = step_name.replace('_|', '|').replace('|-', '|').split('|')
    return "{0}.{3}: \"{2}\"".format(*splitted)


def get_job_status(job_result):
    job_status = 0
    for state in job_result.values():
        job_status = max(job_status, statuses[state['result']])
    job_status = reverse_statues[job_status]
    return job_status


def process_sync_status(status):
    output = {}
    if status.get('return'):
        for k, v in status['return'].items():
            # Clean v
            result = v.pop('result')
            v.pop('__run_num__')
            v.pop('name')
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


def get_latest_job_status(jobs):
    result = None
    for job in jobs:
        if not job.get('return'):
            continue
        job_status = get_job_status(job['return'])
        if job_status == 'running':
            continue
        else:
            return job_status



@app.route("/")
def index():
    minions = client.minions
    ok_status = 0
    for minion in (minions['up'] + minions['down']):
        status = get_latest_job_status(client.get_multiple_job_status(minion,
            "state_hightest_test", max=2))
        if status == 'success':
            ok_status += 1
    return render_template('dashboard.html', minions=client.minions,
        ok_status=ok_status)

@app.route("/minions")
def minions_status():
    minions = client.minions
    jobs = {}
    versions = {}
    for minion in (minions['up']):
        jobs[minion] = process_sync_jobs(client.get_multiple_job_status(minion, "state_hightest_test"))
        versions[minion] = client.cmd(minion, 'test.version')[minion]
    return render_template('minions.html', minions=minions, jobs=jobs,
        roles=client.minions_roles(), versions=versions)

@app.route("/minions/<minion>/check_sync/<jid>")
def minions_show_check_status(minion, jid):
    status = client.get_job_status(minion, jid, key="state_hightest_test")
    if not status:
        return "Unknown jid", 404
    return render_template('sync_status.html', sync_status=status,
        status=process_sync_status(status), minion=minion)

@app.route("/minions/<minion>/do_check_sync")
def minions_do_check_sync(minion):
    jid = client.run_job(minion, 'state.highstate', "state_hightest_test", True, Test=True)
    return redirect(url_for('minions_show_check_status', minion=minion, jid=jid))


@app.route("/deployments")
def deployments():
    return ""

if __name__ == "__main__":
    print "Start ?"
    app.debug = True
    app.run()
