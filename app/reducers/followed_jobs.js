import _ from 'lodash';
import {
  FOLLOW_JOB,
  UNFOLLOW_JOB
} from '../actions/job_follow';

const INITIAL_STATE = [];

export default function(state = INITIAL_STATE, action) {
    let error;
    switch(action.type) {
        case FOLLOW_JOB:
            return _.union(state, [action.payload]);
        case UNFOLLOW_JOB:
            return _.without(state, action.payload);
        default:
            return state;
    }
}
