import store from '../store';
import auth_minion, {MinionStatusOnJobReturn} from '../minions/actions';
import {LogoutUser} from '../login/LoginActions';
import {PushError} from '../errors/actions';
import URI from 'urijs';
import _ from 'lodash';
import {newJobReturn, JobReturn, UpdateModuleFunctionDoc, UpdateModuleFunctionList, UpdateModuleFunctionArgSpec} from '../jobs/actions';

let R = RegExp;

var EVENT_MAP = new Map([
    ['salt/run/(\\d*)/new', [JobReturn]],
    ['salt/job/(\\d*)/new', [JobReturn]],
    ['salt/job/(\\d*)/ret/(.*)', [newJobReturn, MinionStatusOnJobReturn,
                                    UpdateModuleFunctionDoc, UpdateModuleFunctionList,
                                    UpdateModuleFunctionArgSpec]],
    ['salt/auth', [auth_minion]],
]);


var INVALID_WEBSOCKET_TERMINATION = [
    1006
];


function real_time_factory() {
    let token = store.get(['auth', 'token']);
    let settings = store.get('settings');
    let flavour = settings.FLAVOUR;

    if (token == undefined || settings == undefined) {
        return;
    }

    if(flavour == 'rest_cherrypy') {
        var url = URI("")
            .host(settings.API_URL)
            .scheme(`${settings.SECURE_HTTP ? 'https' : 'http'}`)
            .segment([settings.API_PATH, 'events'])
            .search({'token': token});
        var source = new EventSource(url);
    } else {
        var url = URI("")
            .host(settings.API_URL)
            .scheme(`${settings.SECURE_HTTP ? 'wss' : 'ws'}`)
            .segment([settings.API_PATH, 'all_events', token]);
        var source = new WebSocket(url);
    }

    return source;
}


export default function connect_real_time() {
    let token = store.get(['auth', 'token']);
    let settings = store.get('settings');

    if (token == undefined || settings == undefined) {
        return;
    }

    var source = real_time_factory();

    source.onerror = function(e) {
        let errMsg = `Error while connecting to real-time endpoint: ${e}`;
        PushError(errMsg);
        LogoutUser();
    }

    source.onclose = function(e) {
        if(_.includes(INVALID_WEBSOCKET_TERMINATION, e.code)) {
            let errMsg = `Websocket connection was abnormally closed, logout! Reason: ${e.reason}, code: ${e.code}`;
            console.error(errMsg);
            PushError(errMsg);
            LogoutUser();
        }
    }
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
        if(settings.FLAVOUR == 'rest_cherrypy') {
            console.log('sse client ready');
        } else if (settings.FLAVOUR == 'rest_tornado') {
            source.send('websocket client ready');
            console.log('websocket client ready');
        }
    }
}

store.select(['auth', 'token']).on('update', connect_real_time);
store.select('settings').on('update', connect_real_time);

if(store.get(['auth', 'token']) != undefined && store.get('settings') != undefined) {
    connect_real_time();
}
