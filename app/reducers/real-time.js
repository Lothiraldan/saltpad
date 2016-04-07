import {
  SIGNIN_USER_SUCCESS, SIGN_OUT_USER
} from '../actions/user';
import connect_real_time from '../services/real-time';

const INITIAL_STATE = {connected: false, token: null, source: null};

export default function(state = INITIAL_STATE, action) {
    let error;
    switch(action.type) {
        case SIGNIN_USER_SUCCESS:

            var source = connect_real_time(action.payload.token);

            return { ...state, connected: true, token: action.payload.token, source: source};


        case SIGN_OUT_USER:
            source = state.source;
            source.close();
            return {...state, ...INITIAL_STATE};

        default:
            return state;
    }
}
