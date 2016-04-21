import {
  NEW_SALT_JOB
} from '../actions/jobs';

const INITIAL_STATE = {};

export default function(state = INITIAL_STATE, action) {
    let error;
    switch(action.type) {
        case NEW_SALT_JOB:
            let job_id = action.payload.jid;
            let job = action.payload;
            let job_state = {};
            job_state[job_id] = job;
            return {...state, ...job_state};
        default:
            return state;
    }
}
