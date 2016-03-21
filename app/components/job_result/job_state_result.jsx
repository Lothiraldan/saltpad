import React from 'react';
import { Link } from 'react-router';
import _ from 'lodash';
import JobsStoreHEC from '../../jobs/hec'
import moment from 'moment';
import {HidingHEC, HidingPanel} from '../shared/hiding';
import {If} from '../shared/templates';


var statusMap = {"Error": "danger", "Dependency failed": "warning", "Changes": "info",
                 "Success": "success"}

class SingleChunkResult extends React.Component {
  render() {
      let status = this.props.status;
      var chunk_id = this.props.chunk_id;
      let hiding_control = this.props.hiding_control;
      let renderIfOpen = this.props.renderIfOpen;

      var [package_name, chunk_id, chunk_name, package_function] = chunk_id.split('_|-');
      let chunk_function = `${package_name}.${package_function}`;
      let className=`list-group-item list-group-item-${statusMap[status]}`

      let content = _.map(_.toPairs(this.props.chunk), (chunk) => {
          return <li key={chunk[0]}>{chunk[0]}: <pre>{JSON.stringify(chunk[1])}</pre></li>;
      });

      return (<li className={className}>
        <h4>{this.props.hiding_control} {chunk_function}: {chunk_id}</h4>
        <If condition={this.props.open}>
          <ul>
            {content}
          </ul>
        </If>
      </li>)
  }
}
SingleChunkResult = HidingHEC(SingleChunkResult);

export class StateResultStatusMinion extends React.Component {
  render() {
      let status = this.props.status;
      let jobs = this.props.jobs;
      let total_chunk_number = this.props.chunk_number;

      var job_number = _.size(jobs);
      var heading = `${status} ${job_number} / ${total_chunk_number}`;

      var chunks = _.sortBy(jobs, (chunk) => chunk[1]['__run_num__']);
      var chunks = _.map(chunks, (chunk) => {
          return <SingleChunkResult key={chunk[0]} chunk={chunk[1]} chunk_id={chunk[0]} status={status} default_open={false} />;
      });


      let openMap = {"Error": true, "Dependency failed": false, "Changes": true,
                     "Success": false}

      return (
        <HidingPanel heading={heading} status={statusMap[status]} default_open={openMap[status]} div_body={false}>
          {chunks}
        </HidingPanel>
      )
  }
}

export class StateResultMinion extends React.Component  {
    render() {

        let minion = this.props.minion;
        let job_data = this.props.job_data;

        // If job return is a String, it's likely an error
        if(typeof(job_data.return[0]) == 'string') {

          let data = job_data.return[0];

          var heading = `${minion} encountered an error`;
          var chunks = <div>{data}</div>;
          var status = statusMap["Error"];

        } else {

          let grouped_chunks = _.groupBy(_.toPairs(job_data.return), (chunk) => {

              if(chunk[1] == undefined) {
                  return "Undefined";
              }

              if (_.get(chunk[1], 'comment', '').includes('requisite failed')) {
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

          let status_order = ["Error", "Dependency failed", "Changes", "Success"]

          var chunk_number = _.size(job_data.return);
          var heading = `${minion} - ${chunk_number} steps: ${_.size(grouped_chunks["Error"])} in errors, ${_.size(grouped_chunks["Dependency failed"])} requirements failed, ${_.size(grouped_chunks["Changes"])} changes and ${_.size(grouped_chunks["Success"])} in success.`;

          for(let status_id in status_order) {
              let status_label = status_order[status_id];
              if(grouped_chunks[status_label]) {
                  var status = statusMap[status_label];
                  break;
              }
          }

          var chunks = _.map(status_order, (status) => {
              return <StateResultStatusMinion key={status} status={status} jobs={grouped_chunks[status]} chunk_number={chunk_number} />;
          });
        }

        return (
          <HidingPanel heading={heading} status={status} default_open={true}>
            {chunks}
          </HidingPanel>
        )
    }
}
