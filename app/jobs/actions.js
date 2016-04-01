import JobsService from './services';
import store from '../store';
import moment from 'moment';
import _ from 'lodash';
import {JobEventToJobStore, ArgSpecParser} from './utils';

function UpdateJobs(jobs) {
    for (let job_id in jobs) {
        let job_data = jobs[job_id];
        job_data['StartTime'] = moment(job_data['StartTime']).unix()
        job_data['jid'] = job_id;
        let path = ['jobs', job_id];
        if(store.exists(path)) {
            store.merge(path, job_data);
        } else {
            store.set(path, job_data);
        }
    }
}

export function newJobReturn(job_id, minion, job) {
    store.set(['jobs', job_id, 'Result', minion], {'return': job.data.return});
    store.merge(['jobs', job_id], JobEventToJobStore(job.data));
}

export function ListJobs() {
    return JobsService.ListJobs()
        .then(result => result.data.return[0])
        .then(UpdateJobs);
}

export function GetJobDetails(job_id) {
    return JobsService.GetJobDetails(job_id)
        .then(result => result.data.return[0])
        .then(function(result) {
            let r = {};
            r[job_id] = result;
            return r;
        })
        .then(UpdateJobs);
}

export function JobReturn(job_id, job) {
    let path = ['jobs', job_id];
    let job_to_store = JobEventToJobStore(job.data);
    if(store.exists(path)) {
        store.merge(path, job_to_store);
    } else {
        store.set(path, job_to_store);
    }
}

export function UpdateModuleFunctionList(job_id, minion, job) {
    if(job.data['fun'] == 'sys.list_functions') {
        _.map(job.data.return, (moduleFunctionName) => {
            if (store.get(['moduleFunctions', moduleFunctionName]) == undefined) {
                store.set(['moduleFunctions', moduleFunctionName], {});
            }
        });
    }
}

export function UpdateModuleFunctionDoc(job_id, minion, job) {
    if(job.data['fun'] == 'sys.doc') {
        _.map(_.toPairs(job.data.return), ([moduleFunctionName, moduleFunctionDoc]) => {
            store.set(['moduleFunctions', moduleFunctionName, 'doc'], moduleFunctionDoc);
        });
    }
}

export function UpdateModuleFunctionArgSpec(job_id, minion, job) {
    if(job.data['fun'] == 'sys.argspec') {
        _.map(_.toPairs(job.data.return), ([moduleFunctionName, moduleFunctionArgspec]) => {
            store.set(['moduleFunctions', moduleFunctionName, 'argspec'], ArgSpecParser(moduleFunctionArgspec));
        });
    }
}


export function RunJob(matcher, minions, module_function, args, add_to_runned_jobs=true) {

    function last10(job_id, current_data) {
        return _.take(_.sortBy(_.union(current_data, [job_id]), (jid) => -1 * jid), 5);
    }

    return JobsService.RunJob(matcher, minions, module_function, args)
        .then((result) => {
            return result;
        })
        .then((result) => result.data.return[0])
        .then((result) => result.jid)
        .then((job_id) => {
            if(add_to_runned_jobs) {
                if(store.get(['session', 'runned_jobs']) == undefined) {
                    store.set(['session', 'runned_jobs'], []);
                }
                store.apply(['session', 'runned_jobs'], _.partial(last10, job_id));
            }

            // Add to store informations we have
            let job = {Function: module_function, jid: job_id,
                       Target: minions, Arguments: args,
                       'Target-type': matcher}

            let path = ['jobs', job_id]
            if(store.exists(path)) {
                store.merge(path, job);
            } else {
                store.set(path, job);
            }

            return job_id;
        });
}


export function FollowJob(job_id) {
    if(store.get(['session', 'followed_jobs']) == undefined) {
        store.set(['session', 'followed_jobs'], []);
    }
    store.push(['session', 'followed_jobs'], job_id);
}

export function UnfollowJob(job_id) {
    if(store.get(['session', 'followed_jobs']) == undefined) {
        store.set(['session', 'followed_jobs'], []);
    }
    store.apply(['session', 'followed_jobs'], (current_data) => _.without(current_data, job_id));
}
