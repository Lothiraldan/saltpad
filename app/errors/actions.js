import store from '../store';

export function PushError(error) {
    if(store.get('errors') == undefined) {
        store.set('errors', []);
    }
    store.push(['errors'], error);
    store.commit();
}

export function FatalError(error) {
    store.set('fatal_error', error);
    store.commit();
}

export function CleanErrors() {
    store.set('errors', []);
    store.unset('fatal_error');
    store.commit();
}
