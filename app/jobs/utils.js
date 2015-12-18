import React from 'react';
import moment from 'moment';
import _ from 'lodash';

var RunnerJobEventToJobStore = function(job) {
    return {'Function': job['fun'], 'jid': job['jid'], 'User': job['user'],
            'StartTime': job['_stamp']}
}

export var JobEventToJobStore = function(job) {
    let new_job = {'Function': job['fun'], 'jid': job['jid'], 'User': job['user'],
                   'StartTime': moment(job['_stamp']).unix(), 'Target': job['tgt'],
                   'TargetType': job['tgt_type'], 'Arguments': ArgParser(job['arg']),
                   'Minions': job['minions'], 'Return': job['return']}
    return _.omit(new_job, _.isUndefined);
}

export var ArgSpecParser = function(argspec) {
    let default_args_size = _.size(argspec.defaults);
    let args_size = _.size(argspec.args);
    let mandatory_args = _.slice(argspec.args, 0, args_size - default_args_size);
    let default_args = _.zipObject(_.slice(argspec.args, args_size - default_args_size),
                                   argspec.defaults)
    return [mandatory_args, default_args];
}

export function ArgFormatter(args) {
    let [poargs, kwargs] = args;
    let formatted_kwargs = _.map(_.pairs(kwargs), ([arg_key, arg_value]) => {
        return {__kwarg__: true, [arg_key]: arg_value}
    });
    return _.union(poargs, formatted_kwargs);
}

export function ArgParser(salt_formatted_args) {

    if(salt_formatted_args == undefined) {
        return undefined;
    }

    let args = [];
    let kwargs = {};

    for(let arg_id in salt_formatted_args) {
        var arg = salt_formatted_args[arg_id];
        if(_.get(arg, "__kwarg__") == true) {
            kwargs = _.merge(kwargs, _.omit(arg, "__kwarg__"));
        } else {
            args.push(arg);
        }
    }
    return [args, kwargs];
}

export var HighstateStatusOrder = ["Error", "Dependency failed", "Changes", "Success"];
export var HighstateStatusLabel = {"Error": "danger", "Dependency failed": "danger",
                                   "Changes": "info", "Success": "success"}

export function HighstateReturnParser(jobReturn) {
    let grouped_chunks = _.groupBy(_.pairs(jobReturn), (chunk) => {
        if (chunk[1].comment.includes('requisite failed')) {
            return "Dependency failed";
        }

        if (_.size(chunk[1].changes)) {
            return "Changes";
        }

        if (chunk[1].result === true) {
            return "Success";
        }

        if (chunk[1].result === false) {
            return "Error";
        }
    });

    for(let status_id in HighstateStatusOrder) {
        var status_label = HighstateStatusOrder[status_id];
        if(grouped_chunks[status_label]) {
            var status = HighstateStatusLabel[status_label];
            break;
        }
    }

    return {chunks: grouped_chunks, status: status, statusLabel: status_label}
}

export function gradientBackground(chunks) {
    let green = _.size(_.get(chunks, 'Success'));
    let blue = _.size(_.get(chunks, 'Changes'));
    let orange = _.size(_.get(chunks, 'Warning'));
    let red = _.size(_.get(chunks, 'Error')) + _.size(_.get(chunks, 'Dependency failed'));

    let gradient_data = [
        {name: "success", value: green, color: "#d8ffc9"},
        {name: "changes", value: blue, color: "#d9edf7"},
        {name: "warnings", value: orange, color: "#faebcc"},
        {name: "errors", value: red, color: "#f2dede"}
    ]

    return _gradientGenerator(gradient_data);
}

function _gradientGenerator(data) {

    var fullTotal = _.sum(data, (value) => value.value);

    var iteratee = (accumulator, value) => {

        let total = accumulator.total;
        let iterationColorStop = [
            `${value.color} ${(total / fullTotal) * 100}%`,
            `${value.color} ${((value.value + total)/ fullTotal) * 100}%`]

        return {
            total: total + value.value,
            colorsStops: accumulator.colorsStops.concat(iterationColorStop)
        }
    }

    var colorsStops = _.reduce(data, iteratee, {total: 0, colorsStops: []}).colorsStops;
    return {backgroundImage: `linear-gradient(to right, ${colorsStops.join(', ')})`};
}

window.ArgSpecParser = ArgSpecParser;
