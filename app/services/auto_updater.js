import axios from 'axios';
import formurlencoded from 'form-urlencoded';
import store from '../store';
import {UpdateMinionStatus} from '../minions/actions';

class SaltLowStateService {
    Run(params) {
        let query = axios.post(`${BASE_URL}`,
            params,
            {headers: {"X-Auth-Token": store.get(['auth', 'token']),
                       "Content-Type": "application/x-www-form-urlencoded"},
             transformRequest: (data) => formurlencoded.encode(data)});
        return query;
    }
}

var intervalId = {};

function updateMinionStatus() {
    let service = new SaltLowStateService();
    service.Run({client: 'runner', fun: 'manage.status'})
        .then(result => result.data.return[0])
        .then(UpdateMinionStatus);
}

function updateMinionDocs() {
    let service = new SaltLowStateService();
    service.Run({client: 'local_async', 'fun': 'sys.doc', 'tgt': '*', 'arg': []})
        .then(result => console.log("Minion doc", result))
}


function schedule(target, interval) {
    return function() {
        let auth_token = store.get(['auth', 'token']);
        if (auth_token == undefined && intervalId[target.name] != undefined) {
            intervalId[target.name] = undefined;
        } else if (intervalId[target.name] == undefined && auth_token != undefined) {
            intervalId[target.name] = setInterval(target, interval);
        }
    }
}

// store.select(['auth', 'token']).on('update', schedule(updateMinionStatus, 30000));
// schedule(updateMinionStatus, 30000)();

// store.select(['auth', 'token']).on('update', schedule(updateMinionDocs, 10000));
// schedule(updateMinionDocs, 10000)();
