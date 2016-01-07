import store from '../store';

export function LoginUser(token, user) {
    store.set(['auth', 'token'], token);
    store.set(['auth', 'user'], user);
    store.commit();
}

export function LogoutUser() {
    store.unset(['auth', 'token']);
    store.unset(['auth', 'user']);
    store.unset('minions');
    store.unset('jobs');
    store.unset('moduleFunctions');
}

window.logout = LogoutUser
