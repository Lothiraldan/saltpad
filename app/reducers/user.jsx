import {
  SIGNIN_USER, SIGNIN_USER_SUCCESS, SIGNIN_USER_FAILURE, SIGN_OUT_USER
} from '../actions/user';

const INITIAL_STATE = {user: null, status:null, error:null, loading: false};

export default function(state = INITIAL_STATE, action) {
    let error;
    switch(action.type) {
        case SIGNIN_USER_SUCCESS://return authenticated user,  make loading = false and status = authenticated
            return { ...state, user: action.payload.data.return[0], status:'authenticated', error:null, loading: false}; //<-- authenticated
        case SIGN_OUT_USER:
            return {...state, ...INITIAL_STATE};

        default:
            return state;
    }
}
