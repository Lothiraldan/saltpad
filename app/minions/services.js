import axios from 'axios';
import store from '../store';
import URI from 'urijs';
import BaseService from '../services/base_service';

class MinionsService extends BaseService {
    ListMinions = () => {
        let query = this.get(['minions'], {
            headers: {"X-Auth-Token": store.get(['auth', 'token'])}
        });
        return query;
    }
}

export default new MinionsService();
