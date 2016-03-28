import React from 'react';
import { Link } from 'react-router';
import _ from 'lodash';
import JobsStoreHEC from '../../jobs/hec'
import moment from 'moment';
import gen_path from '../../path_utils';


class JobGroupItem extends React.Component {
    render() {
        let job_id = this.props.job_id;
        let job = this.props.job;
        let link = `/job_result/${job_id}`;
        return (
          <li key={job_id} className="list-group-item">
            <span className="badge">{moment.unix(job.StartTime).fromNow()}</span>
            <i className="fa fa-calendar" /> <Link to={gen_path(link)}>[{job_id}] {job.Function} on "{job.Target}"</Link>
          </li>
        )
    }
}

class JobsLast10Widget extends React.Component {
    render() {

        var jobs = _.toPairs(this.props.jobs);
        jobs = _.sortBy(jobs, (job) => -1 * job[0]);
        jobs = _.take(jobs, 10);
        jobs = _.map(jobs, function(job) {
            let [job_id, job_data] = job;
            return <JobGroupItem key={job_id} job_id={job_id} job={job_data} />;
        });

        return (
          <div className="col-lg-12">
            <div className="panel panel-primary">
              <div className="panel-heading">
                <h3 className="panel-title"><i className="fa fa-clock-o" /> Recent Jobs</h3>
              </div>
              <div className="panel-body">
                <div className="list-group">
                  <ul className="list-group">
                    {jobs}
                  </ul>

                  <div className="text-right">
                    <Link to={gen_path("/jobs")}>View All Jobs <i className="fa fa-arrow-circle-right" /></Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )
    }
}

export default JobsStoreHEC(JobsLast10Widget);
