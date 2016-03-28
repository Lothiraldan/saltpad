import store from './store';

export default function gen_path(path) {
    return `${store.get('settings').path_prefix}${path}`;
}
