import store from '../store';

export function PushError(error) {
    if(store.get('errors') == undefined) {
        store.set('errors', []);
    }
    store.push(['errors'], error);
    store.commit();
}
