import axios from 'axios';
import store from '../store';
import BaseService from '../services/base_service';
import formurlencoded from 'form-urlencoded';
import {ArgFormatter} from './utils';

class JobsService extends BaseService {
    ListJobs = () => {
        let params = {client: 'runner', fun: 'jobs.list_jobs'};
        let query = this.post('', [params],
                        {headers: {"X-Auth-Token": store.get(['auth', 'token']),
                                   "Content-Type": "application/json"}
                        });
        return query;
    }

    GetJobDetails = (job_id) => {
        let params = [
            {client: 'runner', fun: 'jobs.list_job', jid: job_id},
            // {client: 'runner', fun: 'jobs.lookup_jid', jid: job_id}
        ];
        let query = this.post('', params, {
            headers: {"X-Auth-Token": store.get(['auth', 'token']),
                      "Content-Type": "application/json"}
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
