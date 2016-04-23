import _ from 'lodash';

export const FOLLOW_JOB = 'FOLLOW_JOB';
export const UNFOLLOW_JOB = 'UNFOLLOW_JOB';

export function FollowJob(job_id) {
    console.log("FollowJob", job_id);
    return {
        type: FOLLOW_JOB,
        payload: job_id
    };
}

export function UnfollowJob(job_id) {
    return {
        type: UNFOLLOW_JOB,
        payload: job_id
    };
}
