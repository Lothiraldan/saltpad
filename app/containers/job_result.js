import React, { Component } from 'react';
import { connect } from 'react-redux';
import JobResult from '../components/job_result';
import _ from 'lodash';
import {FollowJob, UnfollowJob} from '../actions/job_follow';


function mapStateToProps(state, ownProps) {
  return {
    job: _.get(state.jobs, ownProps.params.job_id),
    followed_jobs: state.followed_jobs
  };
}

const mapDispatchToProps = (dispatch) => {
  return {
   UnfollowJob: (job_id) => dispatch(UnfollowJob(job_id)),
   FollowJob: (job_id) => dispatch(FollowJob(job_id)),
   RedoJob: (job_id) => {console.log("Job id redo", job_id);},
   CopyJob: (job_id) => {console.log("Job id copy", job_id);},
  };
};


export default connect(mapStateToProps, mapDispatchToProps)(JobResult);
