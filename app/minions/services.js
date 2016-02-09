import axios from 'axios';
import store from '../store';
import URI from 'urijs';
import BaseService from '../services/base_service';

class MinionsService extends BaseService {
    ListMinions = () => {
        let params = {client: 'local_async', fun: 'test.ping', tgt: '*'};
        let query = this.post('', [params],
                        {headers: {"X-Auth-Token": store.get(['auth', 'token']),
                                   "Content-Type": "application/json"}
                        });
        return query;
    }
}

export default new MinionsService();
