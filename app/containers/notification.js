import React, { Component } from 'react';
import { connect } from 'react-redux';
import Notification from '../components/notification';


function mapStateToProps(state) {
  return {
    jobs: state.jobs,
    followed_jobs: state.followed_jobs,
    last_jobs: state.last_jobs
  };
}

export default connect(mapStateToProps, null)(Notification);
