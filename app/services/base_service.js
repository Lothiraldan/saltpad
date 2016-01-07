import axios from 'axios';
import store from '../store';
import URI from 'urijs';

export default class BaseService {
    baseUrl() {
        let settings = store.get('settings');

        return URI("")
            .host(settings.API_URL)
            .scheme(`${settings.SECURE_HTTP ? 'https' : 'http'}`);
    }

    get(segment, ...params) {
        return axios.get(this.baseUrl().segment(segment), ...params);
    }

    post(segment, ...params) {
        return axios.post(this.baseUrl().segment(segment), ...params);
    }
}
