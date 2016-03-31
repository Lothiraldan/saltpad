import store from './store';
import _ from 'lodash';

export default function gen_path(path) {
    let path_prefix = _.get(store.get('settings'), 'PATH_PREFIX', '');
    return `${path_prefix}${path}`;
}
