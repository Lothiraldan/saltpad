import React from 'react';
import moment from 'moment';
import _ from 'lodash';
import {Link} from 'react-router';

import {SessionHEC} from '../hec/session';
import {SingleJobStoreHEC} from '../jobs/hec';
import {If} from './shared/templates';

class JobRunNotification extends React.Component {
  render() {

    const job = this.props.job;
    let MinionsNumber = _.size(job.Minions);
    let ResultNumber = _.size(job.Result);

    var className = "fa fa-clock-o";

    if(ResultNumber < MinionsNumber) {
        className = "fa fa-spinner fa-spin";
    }

    return(
      <div className="desc">
        <div className="thumb">
          <span className="badge bg-theme">
            <i className={className} />
          </span>
        </div>
        <div className="details">
          <p><muted>{moment.unix(this.props.job.StartTime).fromNow()}</muted><br/>
             <Link to={`/job_result/${this.props.job.jid}`}>{this.props.job.Function} on {this.props.job.Target}</Link><br/>
             <i className="fa fa-users"> {ResultNumber}/{MinionsNumber}</i><br/>
             {this.props.job.jid}<br/>
          </p>
        </div>
      </div>
    )
  }
}
JobRunNotification.displayName = 'JobRunNotification';


class Notification extends React.Component {
    render() {

      let runned_jobs = _.sortBy(this.props.session['runned_jobs'], (jid) => -1 * jid);
      let last_runned_jobs = _.map(runned_jobs,
          (job_id) => {
            let JobRunNotifHEC = SingleJobStoreHEC(JobRunNotification, "job_id");
            return <JobRunNotifHEC job_id={job_id} key={job_id} />;
          });

      let followed_jobs = _.sortBy(this.props.session['followed_jobs'], (jid) => -1 * jid);
      let last_followed_jobs = _.map(followed_jobs,
          (job_id) => {
            let JobRunNotifHEC = SingleJobStoreHEC(JobRunNotification, "job_id");
            return <JobRunNotifHEC job_id={job_id} key={job_id} />;
          });

      return (
        <div className="col-lg-12 ds">
          <If condition={_.size(last_followed_jobs) != 0}>
            <h3>
              FOLLOWED JOBS
            </h3>

            {last_followed_jobs}
          </If>

          <h3>RECENTLY EXECUTED JOBS</h3>

          {last_runned_jobs}

        </div>
      )
    }
}

export default SessionHEC(Notification);
