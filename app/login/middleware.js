import store from '../store'
import history from '../history'
import gen_path from '../path_utils'

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
