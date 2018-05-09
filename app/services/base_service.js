import axios from 'axios';
import store from '../store';
import URI from 'urijs';
import _ from 'lodash';

axios.defaults.headers.common['Accept'] = 'application/json';

export default class BaseService {
    baseUrl() {
        let settings = store.get('settings');
        return URI("")
            .host(settings.API_URL)
            .scheme(`${settings.SECURE_HTTP ? 'https' : 'http'}`);
    }

    get(segment, ...params) {
        let settings = store.get('settings');
        return axios.get(this.baseUrl().segment([settings.API_PATH].concat(segment)), ...params);
    }

    post(segment, data, ...params) {
        let settings = store.get('settings');
        return axios.post(this.baseUrl().segment([settings.API_PATH].concat(segment)), data, ...params);
    }
}
