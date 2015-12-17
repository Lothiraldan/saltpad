import _ from 'lodash';
import React, { PropTypes } from 'react';
import moment from 'moment';

import {SingleJobStoreHEC} from '../jobs/hec';
import MinionList from './job_result/minion_list';
import {RawResultMinion} from './job_result/job_raw_result';
import {StateResultMinion} from './job_result/job_state_result';
import JobEmptyResult from './job_result/job_empty_result';
import JobFollowStar from './job_follow';
import {RunJob} from '../jobs/actions';
import {ArgParser} from '../jobs/utils';


class MinionResult extends React.Component {
    render() {

      let job = this.props.job;


      var minions_list = _.map(job.Minions, function(minion) {
          let job_data = _.get(job.Result, minion, undefined);
          var heading = minion;
          if(job_data == undefined) {
            return <JobEmptyResult key={minion} minion={minion}></JobEmptyResult>;
          }

          else if(job.Function == 'state.highstate') {
            return <StateResultMinion key={minion} minion={minion} job_data={job_data}></StateResultMinion>;
          }

          else {
            return <RawResultMinion key={minion} minion={minion} job_data={job_data}></RawResultMinion>;
          }

          return (
            <div>
              {content}
            </div>
          )
      });

      return (
        <div className="col-lg-12">
          {minions_list}
        </div>
      )
  }
}


class JobRunnerResult extends React.Component {

    copyJob = (e) => {
        let job = this.props.job;
        this.context.history.pushState({copy_job: job}, '/job/run/', null);
    }

    redoJob = (e) => {
        let job = this.props.job;
        RunJob(job['TargetType'], job['Target'], job['Function'], job['Arguments'])
          .then(job_id => {
            if(job_id) {
              this.context.history.pushState(null, `/job_result/${job_id}`, null);
            }
          });
    }

    render() {

      let job = this.props.job;

      return (
        <div>
          <div className="col-lg-12">
            <h1>{job.Function} started {moment.unix(job.StartTime).fromNow()} by {job.User} <JobFollowStar job_id={job.jid}></JobFollowStar></h1>

            <h2>
              TODO ADD COPY AND RELAUNCH
            </h2>

            <h3>Result:</h3>
            <pre>{JSON.stringify(job)}</pre>
          </div>
        </div>
      )
    }
}

class JobMinionResult extends React.Component {

    copyJob = (e) => {
        let job = this.props.job;
        job['Arguments'] = ArgParser(job['Arguments'])[1];
        this.context.history.pushState({copy_job: job}, '/job/run/', null);
    }

    redoJob = (e) => {
        let job = this.props.job;
        RunJob(job['TargetType'], job['Target'], job['Function'], ArgParser(job['Arguments']))
          .then(job_id => {
            if(job_id) {
              this.context.history.pushState(null, `/job_result/${job_id}`, null);
            }
          });
    }

    render() {

      let job = this.props.job;

      return (
        <div>
          <div className="col-lg-12">
            <h1>{job.Function} on {job.Target} started {moment.unix(job.StartTime).fromNow()} by {job.User} <JobFollowStar job_id={job.jid}></JobFollowStar></h1>

            <h2>
              <button className="btn btn-primary btn-sm" onClick={this.copyJob}>
                <i className="fa fa-copy"></i> Copy job parameters
              </button>

              <button className="btn btn-primary btn-sm" style={{marginLeft: "10px"}} onClick={this.redoJob}>
                <i className="fa fa-refresh"></i> Redo job with same parameters
              </button>
            </h2>

            <h3>Minions:</h3>
            <MinionList job={job}/>
          </div>
          <MinionResult job={job}/>
        </div>
      )
    }
}
JobMinionResult.contextTypes = {
  history: React.PropTypes.object.isRequired
}

class JobResult extends React.Component {

    render() {

      let job = this.props.job;

      if(_.startsWith(job.Function, 'runner')) {
        return <JobRunnerResult job={job}/>
      } else {
        return <JobMinionResult job={job}/>
      }
    }
}

JobResult.displayName = "JobResult";
JobResult.contextTypes = {
  history: React.PropTypes.object.isRequired
}

export default SingleJobStoreHEC(JobResult, "params.job_id");

