import React, { Component } from 'react';
import { connect } from 'react-redux';
import JobHistory from '../components/job_history';


function mapStateToProps(state) {
  return {
    jobs: state.jobs,
  };
}

export default connect(mapStateToProps, null)(JobHistory);
