import store from '../store';
import auth_minion, {MinionStatusOnJobReturn} from '../minions/actions';
import URI from 'urijs';
import {newJobReturn, JobReturn, UpdateModuleFunctionDoc, UpdateModuleFunctionList, UpdateModuleFunctionArgSpec} from '../jobs/actions';

let R = RegExp;

var EVENT_MAP = new Map([
    ['salt/run/(\\d*)/new', [JobReturn]],
    ['salt/job/(\\d*)/new', [JobReturn]],
    ['salt/job/(\\d*)/ret/(\\w*)', [newJobReturn, MinionStatusOnJobReturn,
                                    UpdateModuleFunctionDoc, UpdateModuleFunctionList,
                                    UpdateModuleFunctionArgSpec]],
    ['salt/auth', [auth_minion]],
]);

export default function connect_ws() {
    let token = store.get(['auth', 'token']);
    let settings = store.get('settings');

    if (token == undefined || settings == undefined) {
        return;
    }

    var url = URI("")
      .host(settings.API_URL)
      .scheme(`${settings.SECURE_HTTP ? 'wss' : 'ws'}`)
      .segment(['all_events', token]);

    var source = new WebSocket(url);

    source.onerror = function(e) { console.error('error!', e); };
    source.onmessage = e => {
        let raw_data = e.data.replace("data: ", "");
        let data = JSON.parse(raw_data);

        for(let entry of EVENT_MAP) {
            let match = data.tag.match(new R(entry[0]));
            if (match) {
                for(let action of entry[1]) {
                    action(...match.slice(1), data);
                }
            }
        }
    };

    source.onopen = () => {
        source.send('websocket client ready');
    }

    // source.close();
}

store.select(['auth', 'token']).on('update', connect_ws);
store.select('settings').on('update', connect_ws);

if(store.get(['auth', 'token']) != undefined && store.get('settings') != undefined) {
    connect_ws();
}
