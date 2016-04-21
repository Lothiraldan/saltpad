import _ from 'lodash';

import {
  NEW_SALT_JOB
} from '../actions/jobs';

const INITIAL_STATE = {};

export default function(state = INITIAL_STATE, action) {
    let error;
    switch(action.type) {
        case NEW_SALT_JOB:
            let minions = _.map(action.payload.Minions, minion => {
                return {};
            });
            return {...minions, ...state};
        default:
            return state;
    }
}
