import store from '../store';
import MinionsService from './services';
import _ from 'lodash';
import moment from 'moment';

export default function auth_minion(auth_payload) {
    let minion_id = auth_payload.data.id;
    var auth_payload = auth_payload.data;
    let minion_data = {status: auth_payload.act, latest_auth: auth_payload._stamp};

    store.set(['minions', minion_id], minion_data);
}

export function ListMinions() {
    return MinionsService.ListMinions()
        .then(result => result.data.return[0]);
}

export function UpdateMinionStatus(minion_status) {
    _.map(_.toPairs(minion_status), ([status, minions]) => _.map(minions, (minion) => store.set(['minions', minion, 'status'], status)));
}

export function MinionStatusOnJobReturn(job_id, minion, job) {
    store.set(['minions', minion, 'last_seen'], moment(job.data['_stamp']));

    if(job.data['fun'] == 'test.ping') {
        if(job.data.return) {
            var status = 'up';
        } else {
            var status = 'down';
        }
        store.set(['minions', minion, 'status'], status);
    }

    if(job.data['fun'] == 'test.version') {
        store.set(['minions', minion, 'version'], job.data.return);
    }
}
