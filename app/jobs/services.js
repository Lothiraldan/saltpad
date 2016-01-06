import axios from 'axios';
import store from '../store';
import BaseService from '../services/base_service';
import formurlencoded from 'form-urlencoded';
import {ArgFormatter} from './utils';

class JobsService extends BaseService {
    ListJobs = () => {
        let query = this.get(['jobs'], {
            headers: {"X-Auth-Token": store.get(['auth', 'token'])}
        });
        return query;
    }

    GetJobDetails = (job_id) => {
        let query = this.get(['jobs', job_id], {
            headers: {"X-Auth-Token": store.get(['auth', 'token'])}
        });
        return query;
    }

    RunJob = (matcher, target, module_function, args) => {
        let params = {client: 'local_async', expr_form: matcher, tgt: target,
                      fun: module_function, arg: ArgFormatter(args)};
        let query = this.post('', [params],
                        {headers: {"X-Auth-Token": store.get(['auth', 'token']),
                                   "Content-Type": "application/json"}
                        });
        return query;
    }
}

export default new JobsService();
