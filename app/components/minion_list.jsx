import _ from 'lodash';
import React, { PropTypes } from 'react'
import MinionsStoreHEC from '../minions/hec'
import {BootstrapTable, TableHeaderColumn} from 'react-bootstrap-table';
import {ReactBootstrapTableStyle} from '../../node_modules/react-bootstrap-table/css/react-bootstrap-table.min.css';
import moment from 'moment';
import { Link } from 'react-router';


class MinionList extends React.Component {
    render() {

      var minions = _.map(_.pairs(this.props.minions),
                          ([minion_id, minion_data]) => _.merge({id: minion_id}, minion_data));

      function DateFormatter(job_start_time, job){
        return moment.unix(job_start_time).calendar();
      }

      function JidOutputLink(jid, job){
        let link = `/job_result/${jid}`;
        return <Link to={link}>Output</Link>;
      }

      function StatusClassName(fieldValue, row, rowIdx, colIdx) {
        if(fieldValue=='up') {
          return 'success';
        } else {
          return 'danger';
        }
      }

      return (
        <div>
          <h1>List of minions</h1>
          <BootstrapTable data={minions} striped={true} hover={true} pagination={true} search={true}>
              <TableHeaderColumn dataField="id" isKey={true} dataSort={true}>Minion id</TableHeaderColumn>
              <TableHeaderColumn dataField="version" dataSort={true}>Minion version</TableHeaderColumn>
              <TableHeaderColumn dataField="status" dataSort={true} columnClassName={StatusClassName}>Status</TableHeaderColumn>
          </BootstrapTable>
        </div>
      )
    }
}

MinionList.displayName = "Dashboard";

export default MinionsStoreHEC(MinionList);

