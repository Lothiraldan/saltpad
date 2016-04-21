import React, { Component } from 'react';
import { connect } from 'react-redux';
import JobsLast10Widget from '../../components/dashboard/job_last_10';


function mapStateToProps(state) {
  return {
    jobs: state.jobs,
  };
};

export default connect(mapStateToProps, null)(JobsLast10Widget);
