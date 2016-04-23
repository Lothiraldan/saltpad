import {
  NEW_SALT_JOB,
  SALT_JOB_RETURN
} from '../actions/jobs';

const INITIAL_STATE = {};

export default function(state = INITIAL_STATE, action) {
    let error;
    switch(action.type) {
        case NEW_SALT_JOB:
            var job_id = action.payload.jid;
            var job = action.payload;
            var job_state = {};
            job_state[job_id] = job;
            return {...state, ...job_state};
        case SALT_JOB_RETURN:
            var job_id = action.payload.jid;
            var job = action.payload;
            var job_state = {};
            job_state[job_id] = job;
            return {...state, ...job_state};
        default:
            return state;
    }
}
