import _ from 'lodash';

import {
  NEW_SALT_JOB,
  SALT_JOB_RETURN
} from '../actions/jobs';

const INITIAL_STATE = {};

export default function(state = INITIAL_STATE, action) {
    let error;
    switch(action.type) {
        case NEW_SALT_JOB:
            let minions = {};
            for (let minion of action.payload.Minions) {
                minions[minion] = {};
            }
            return {...minions, ...state};
        case SALT_JOB_RETURN:
            let minion = {
                [action.payload.minion_id]: {}
            };
            return {...minion, ...state};
        default:
            return state;
    }
}
