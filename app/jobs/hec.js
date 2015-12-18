import React, {Component, PropTypes} from 'react';
import _ from 'lodash';

import {ListJobs, GetJobDetails, RunJob} from './actions';
import JobsStore from './store';
import store from '../store';
import BaseHEC from '../hec/base';
import {JobEventToJobStore} from '../jobs/utils';

export default function(DecoratedComponent) {
    class JobsStoreHEC extends Component {

        constructor(props, context) {
            super(props, context);
            this.state = store.get("jobs");
        }

        updateState = () => {
            this.setState(store.get("jobs") || {});
        }

        componentWillMount = () => {
            this.mounted = true;
            this.updateState();
            if(_.size(this.state) == 0) {
                ListJobs();
            }
            store.select('jobs').on('update', this.updateState);
        }

        componentWillUnmount = () => {
            store.select('jobs').off(this.updateState);
        }

        render = () => {
            return <DecoratedComponent jobs={this.state} {...this.props} />
        }
    }

    JobsStoreHEC.displayName = `JobsStoreHEC(${DecoratedComponent.displayName})`;

    return JobsStoreHEC;
}

export function SingleJobStoreHEC(DecoratedComponent, job_id_param) {
    class SingleJobStoreHEC extends Component {

        constructor(props, context) {
            super(props, context);
        }

        componentWillUpdate(nextProps, nextState) {
            let currentJobId = this.getJobId();
            let nextJobId = _.get(nextProps, job_id_param);

            if(nextJobId != currentJobId) {
                store.select(['jobs', currentJobId]).off(this.updateState);
                store.select(['jobs', nextJobId]).on('update', this.updateState);
                this.updateState(null, nextJobId);
            }
        }

        updateState = (event_data, job_id = undefined) => {
            if (job_id == undefined) {
                var job_id = this.getJobId();
            }

            var job = store.get(["jobs", job_id]) || {};

            var runner_job = false;

            let Result = _.get(job, 'Result');
            let master_id = _.get(_.keys(Result), '0');

            // Check if it's a runner job
            if (master_id && _.startsWith(_.get(job, ['Result', master_id, 'return', 'fun']), 'runner')) {
                var job = JobEventToJobStore(_.get(job, ['Result', master_id, 'return']));
                runner_job = true;
            }

            // If we don't have the list of minions, it means it's not's
            // up-to-date
            if (_.get(job, 'Minions', undefined) == undefined && !runner_job) {
                GetJobDetails(job_id)
                  .catch(function(err) {
                    console.error("Error retrieving job details");
                  });
            }
            this.setState(job);
        }

        getJobId = () => {
            return _.get(this.props, job_id_param);
        }

        componentWillMount = () => {
            this.updateState();
            store.select(['jobs', this.getJobId()]).on('update', this.updateState);
        }

        componentWillUnmount = () => {
            store.select(['jobs', this.getJobId()]).off(this.updateState);
        }

        render = () => {
            return <DecoratedComponent {...this.props} job={this.state} />;
        }
    }

    SingleJobStoreHEC.propTypes = {
        [job_id_param]: PropTypes.string.isRequired
    }

    SingleJobStoreHEC.displayName = `SingleJobStoreHEC(${DecoratedComponent.displayName})`;

    return SingleJobStoreHEC;
}

export function ModuleFunctionsStoreHEC(DecoratedComponent) {
    class ModuleFunctionsStoreHEC extends Component {

        constructor(props, context) {
            super(props, context);
        }

        updateState = () => {
            var srcModuleFunctions = store.get(["moduleFunctions"]) || {}
            var moduleFunctions = _.transform(srcModuleFunctions,
                function(result, n, key) {
                    result[key] = _.pick(n, []);
                }
            );

            this.setState(moduleFunctions);
        }

        componentWillMount = () => {
            this.updateState();
            store.select(['moduleFunctions']).on('update', this.updateState);
        }

        componentWillUnmount = () => {
            store.select(['moduleFunctions']).off(this.updateState);
        }

        render = () => {
            return <DecoratedComponent {...this.props} moduleFunctions={this.state} />;
        }
    }

    ModuleFunctionsStoreHEC.displayName = `ModuleFunctionsStoreHEC(${DecoratedComponent.displayName})`;

    return ModuleFunctionsStoreHEC;
}

export function ModuleFunctionStoreHEC(DecoratedComponent, moduleFunctionName, doc=false, argspec=false) {

    let pickArgs = [];

    if(doc) {
        pickArgs.push("doc");
    }

    if(argspec) {
        pickArgs.push("argspec");
    }

    class ModuleFunctionStoreHEC extends Component {

        constructor(props, context) {
            super(props, context);
            this.state=undefined;
        }

        updateState = () => {
            let moduleFunction = store.get(["moduleFunctions", moduleFunctionName]) || {};

            if(doc && _.get(moduleFunction, "doc") === undefined) {
                RunJob('glob', '*', 'sys.doc', [ [moduleFunctionName] , {}], false);
            }

            if(argspec && _.get(moduleFunction, "argspec") === undefined) {
                RunJob('glob', '*', 'sys.argspec', [ [moduleFunctionName] , {}], false);
            }

            this.setState(_.pick(moduleFunction, pickArgs));
        }

        componentWillMount = () => {
            if (moduleFunctionName != undefined) {
                this.updateState();
                store.select(["moduleFunctions", moduleFunctionName]).on('update', this.updateState);
            }
        }

        componentWillUnmount = () => {
            if (moduleFunctionName != undefined) {
               store.select(["moduleFunctions", moduleFunctionName]).off(this.updateState);
            }
        }

        render = () => {
            return <DecoratedComponent {...this.props} moduleFunction={this.state} moduleFunctionName={moduleFunctionName} key={"ModuleFunctionStoreHEC"} />;
        }
    }

    ModuleFunctionStoreHEC.displayName = `ModuleFunctionStoreHEC(${DecoratedComponent.displayName})`;

    return ModuleFunctionStoreHEC;

}
