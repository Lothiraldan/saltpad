import _ from 'lodash';
import {JobEventToJobStore} from '../jobs/utils';

export const NEW_SALT_JOB = 'NEW_SALT_JOB';
export const SALT_JOB_RETURN = 'SALT_JOB_RETURN';

export function newSaltJob(job_id, payload) {
    let job = JobEventToJobStore(payload.data);
    return {
        type: NEW_SALT_JOB,
        payload: job
    };
}

export function saltJobReturn(job_id, minion_id, payload) {
    let job = JobEventToJobStore(payload.data);
    console.log("Job id", job_id, minion_id, payload.data, job);
    return {
        type: SALT_JOB_RETURN,
        payload: job
    };
}
