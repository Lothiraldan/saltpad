import React, {Component} from 'react';
import _ from 'lodash';

class JobFollowStar extends Component {

    onClick = (e) => {
        console.log("Onclik props", this.props);
        if(this.isJobFollowed()) {
            this.props.UnfollowJob(this.props.job_id);
        } else {
            this.props.FollowJob(this.props.job_id);
        }
    }

    isJobFollowed = () => {
        return _.includes(this.props.followed_jobs, this.props.job_id);
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

export default JobFollowStar;
