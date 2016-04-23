import React, { Component } from 'react';
import { connect } from 'react-redux';
import JobTemplates from '../components/job_templates';
import _ from 'lodash';
import {FollowJob, UnfollowJob} from '../actions/job_follow';


function mapStateToProps(state, ownProps) {
  return {
    templates: window.settings.templates,
  };
}

const mapDispatchToProps = (dispatch) => {
  return {
   RedoJob: (job_id) => {console.log("Job id redo", job_id);},
   CopyJob: (job_id) => {console.log("Job id copy", job_id);},
  };
};


export default connect(mapStateToProps, mapDispatchToProps)(JobTemplates);
