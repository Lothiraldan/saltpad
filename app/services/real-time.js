import auth_minion, {MinionStatusOnJobReturn} from '../minions/actions';
import {LogoutUser} from '../login/LoginActions';
import {PushError} from '../errors/actions';
import URI from 'urijs';
import _ from 'lodash';
import {newJobReturn, JobReturn, UpdateModuleFunctionDoc, UpdateModuleFunctionList, UpdateModuleFunctionArgSpec} from '../jobs/actions';
import {newSaltJob, saltJobReturn} from '../actions/jobs';
import {store} from '../store';

let R = RegExp;

var EVENT_MAP = new Map([
    ['salt/run/(\\d*)/new', [JobReturn]],
    ['salt/job/(\\d*)/new', [JobReturn]],
    ['salt/job/(\\d*)/ret/(.*)', [newJobReturn, MinionStatusOnJobReturn,
                                    UpdateModuleFunctionDoc, UpdateModuleFunctionList,
                                    UpdateModuleFunctionArgSpec]],
    ['salt/auth', [auth_minion]],
]);


var ACTION_MAP = new Map([
    ['salt/job/(\\d*)/new', newSaltJob],
    ['salt/job/(\\d*)/ret/(.*)', saltJobReturn]
]);


var INVALID_WEBSOCKET_TERMINATION = [
    1006
];


function real_time_factory(token) {
    let settings = window.settings;
    let flavour = settings.FLAVOUR;

    if (token === undefined || settings === undefined) {
        return;
    }

    if(flavour == 'rest_cherrypy') {
        var url = URI("")
            .host(settings.API_URL)
            .scheme(`${settings.SECURE_HTTP ? 'https' : 'http'}`)
            .segment(['events'])
            .search({'token': token});
        var source = new EventSource(url);
    } else {
        var url = URI("")
            .host(settings.API_URL)
            .scheme(`${settings.SECURE_HTTP ? 'wss' : 'ws'}`)
            .segment(['all_events', token]);

        var source = new WebSocket(url);
    }

    return source;
}


export default function connect_real_time(token) {
    let settings = window.settings;
    var dispatch = store.dispatch;

    if (token === undefined || settings === undefined) {
        return;
    }

    var source = real_time_factory(token);

    source.onerror = function(e) {
        let errMsg = `Error while connecting to real-time endpoint: ${url}`;
        PushError(errMsg);
        LogoutUser();
    };

    source.onclose = function(e) {
        console.debug("Real-time source was closed");
        if(_.includes(INVALID_WEBSOCKET_TERMINATION, e.code)) {
            let errMsg = `Websocket connection was abnormally closed, logout! Reason: ${e.reason}, code: ${e.code}`;
            console.error(errMsg);
            PushError(errMsg);
            LogoutUser();
        }
    };

    source.onmessage = e => {
        let raw_data = e.data.replace("data: ", "");
        let data = JSON.parse(raw_data);

        for(let entry of ACTION_MAP) {
            let match = data.tag.match(new R(entry[0]));
            if (match) {
                dispatch(entry[1](...match.slice(1), data));
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
    };

    return source;
}
