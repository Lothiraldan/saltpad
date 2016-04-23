import _ from 'lodash';
import React, { PropTypes } from 'react';
import {BootstrapTable, TableHeaderColumn} from 'react-bootstrap-table';
import {ReactBootstrapTableStyle} from '../../node_modules/react-bootstrap-table/css/react-bootstrap-table.min.css';
import moment from 'moment';
import { Link } from 'react-router';
import gen_path from '../path_utils';

class JobHistory extends React.Component {
    render() {

      var jobs = _.toPairs(this.props.jobs);
      jobs = _.sortBy(jobs, (job) => -1 * job[0]);
      jobs = _.map(jobs, (job) => job[1]);

      function ArgumentsFormatter(job_arguments, job){
        return JSON.stringify(job_arguments);
      }

      function DateFormatter(job_start_time, job){
        return moment.unix(job_start_time).calendar();
      }

      function JidOutputLink(jid, job){
        let link = gen_path(`/job_result/${jid}`);
        return <Link to={link}>Output</Link>;
      }

      return (
        <div>
          <h1>List of executed jobs</h1>
          <BootstrapTable data={jobs} striped={true} hover={true} pagination={true} search={true}>
              <TableHeaderColumn dataField="jid" isKey={true} dataSort={true}>Job ID</TableHeaderColumn>
              <TableHeaderColumn dataField="Function" dataSort={true}>Function</TableHeaderColumn>
              <TableHeaderColumn dataField="Target" dataSort={true}>Target</TableHeaderColumn>
              <TableHeaderColumn dataField="Arguments" dataSort={true} dataFormat={ArgumentsFormatter}>Arguments</TableHeaderColumn>
              <TableHeaderColumn dataField="StartTime" dataSort={true} dataFormat={DateFormatter}>Launched at</TableHeaderColumn>
              <TableHeaderColumn dataField="User">User</TableHeaderColumn>
              <TableHeaderColumn dataField="jid" dataFormat={JidOutputLink}>Output</TableHeaderColumn>
          </BootstrapTable>
        </div>
      )
    }
}

JobHistory.displayName = "Dashboard";

export default JobHistory;

