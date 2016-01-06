import store from '../store'
import history from '../history'

export default function loginRequired(nextState, replaceState) {
    if (store.get(['auth', 'token']) == undefined) {
        replaceState({ nextPathname: nextState.location.pathname }, '/login');
    }
}

store.select('auth').on('update', function() {
    if(store.get(['auth', 'token']) == undefined) {
        history.replaceState({ nextPathname: null}, '/login');
    }
});
