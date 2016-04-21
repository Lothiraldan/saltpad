import React, { Component } from 'react';
import { connect } from 'react-redux';
import JobCounterWidget from '../../components/dashboard/job_counter';


function mapStateToProps(state) {
  return {
    jobs: state.jobs,
  };
};

export default connect(mapStateToProps, null)(JobCounterWidget);
