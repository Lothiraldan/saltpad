import _ from 'lodash';
import React, { Component, PropTypes } from 'react';
import {BootstrapTable, TableHeaderColumn} from 'react-bootstrap-table';
import {ReactBootstrapTableStyle} from '../../node_modules/react-bootstrap-table/css/react-bootstrap-table.min.css';

import SettingsStoreHEC from '../hec/settings';
import {RunJob} from '../jobs/actions';


class JobTemplates extends Component {


    CopyTemplate = (template_name, e) => {
        let template = this.props.settings.templates[template_name];
        let formatted_template = {'Target-type': template.matcher,
                                  'Target': template.target,
                                  'Function': template.moduleFunction,
                                  'Arguments': template.arguments}
        this.context.history.pushState({copy_job: formatted_template}, '/job/run/', null);
    }

    redoJob = (e) => {
        let job = this.props.job;
        RunJob(job['Target-type'], job['Target'], job['Function'], job['Arguments'])
          .then(job_id => {
            if(job_id) {
              this.context.history.pushState(null, `/job_result/${job_id}`, null);
            }
          });
    }

    LaunchTemplate = (template_name, e) => {
        let template = this.props.settings.templates[template_name];
        RunJob(template['matcher'], template['target'],
               template['moduleFunction'], [[], template['arguments']])
          .then(job_id => {
            if(job_id) {
              this.context.history.pushState(null, `/job_result/${job_id}`, null);
            }
          });

    }

    render() {
        if(_.size(_.get(this.props.settings, 'templates', {})) == 0) {
            return <div>No template defined, why not starting now?</div>;
        }

        let templates = _.map(_.toPairs(this.props.settings.templates),
            ([template_name, template_body]) => _.merge({name: template_name}, template_body)
        );

        function ArgumentsFormatter(job_arguments, job) {
            return JSON.stringify(job_arguments);
        }


        var CopyJobTemplate = (template_name, template) => {
            return (
                <button className="btn btn-primary btn-sm" onClick={_.partial(this.CopyTemplate, template_name)}>
                    <i className="fa fa-copy" /> Copy job parameters
                </button>
            )
        }

        var RunJobTemplate = (template_name, template) => {
            return (
                <button className="btn btn-primary btn-sm" onClick={_.partial(this.LaunchTemplate, template_name)}>
                    <i className="fa fa-play" /> Launch job template
                </button>
            )
        }

        return (
            <div>
              <h1>List of jobs templates</h1>
              <BootstrapTable data={templates} striped={true} hover={true} pagination={true} search={true}>
                  <TableHeaderColumn dataField="name" isKey={true} dataSort={true}>Name</TableHeaderColumn>
                  <TableHeaderColumn dataField="description">Description</TableHeaderColumn>
                  <TableHeaderColumn dataField="matcher" dataSort={true}>Matcher</TableHeaderColumn>
                  <TableHeaderColumn dataField="target" dataSort={true}>Target</TableHeaderColumn>
                  <TableHeaderColumn dataField="moduleFunction" dataSort={true}>Function</TableHeaderColumn>
                  <TableHeaderColumn dataField="arguments" dataSort={true} dataFormat={ArgumentsFormatter}>Arguments</TableHeaderColumn>
                  <TableHeaderColumn dataField="name" dataFormat={CopyJobTemplate}>Copy</TableHeaderColumn>
                  <TableHeaderColumn dataField="name" dataFormat={RunJobTemplate}>Launch</TableHeaderColumn>
              </BootstrapTable>
            </div>
        );
    }
}
JobTemplates.displayName = "JobTemplates";
JobTemplates.contextTypes = {
  history: React.PropTypes.object.isRequired
}


export default SettingsStoreHEC(JobTemplates);
