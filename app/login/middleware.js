import store from '../store'
import history from '../history'
import gen_path from '../path_utils'

import { routerActions } from 'react-router-redux';
import { UserAuthWrapper } from 'redux-auth-wrapper';

export default function loginRequired(nextState, replaceState) {
    if (store.get(['auth', 'token']) == undefined) {
        replaceState({ nextPathname: nextState.location.pathname }, gen_path('/login'));
    }
}

store.select('auth').on('update', function() {
    if(store.get(['auth', 'token']) == undefined) {
        history.replaceState({ nextPathname: null}, gen_path('/login'));
    }
});

export const UserIsAuthenticated = UserAuthWrapper({
  authSelector: state => state.user.user, // how to get the user state
  redirectAction: routerActions.replace, // the redux action to dispatch for redirect
  wrapperDisplayName: 'UserIsAuthenticated' // a nice name for this auth check
})
