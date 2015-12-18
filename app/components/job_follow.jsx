import React, {Component} from 'react';
import _ from 'lodash';

import {SessionHEC} from '../hec/session';
import {FollowJob, UnfollowJob} from '../jobs/actions';

class JobFollowStar extends Component {

    onClick = (e) => {
        if(this.isJobFollowed()) {
            UnfollowJob(this.props.job_id);
        } else {
            FollowJob(this.props.job_id);
        }
    }

    isJobFollowed = () => {
        return _.contains(this.props.session['followed_jobs'], this.props.job_id);
    }

    render() {

        if(this.isJobFollowed()) {
            var className = "fa fa-star";
        } else {
            var className = "fa fa-star-o";
        }

        return (
            <i className={className} style={{cursor: 'pointer'}} onClick={this.onClick} />
        )
    }
}

export default SessionHEC(JobFollowStar);
