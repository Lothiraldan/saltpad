import React, { Component } from 'react';
import { connect } from 'react-redux';
import Dashboard from '../components/Dashboard';
import MinionCounterWidget from './dashboard/minion_counter';
import JobCounterWidget from './dashboard/job_counter';
import JobsLast10Widget from './dashboard/job_last_10';


function mapStateToProps(state) {
  return {
    MinionCounterWidget: MinionCounterWidget,
    JobCounterWidget: JobCounterWidget,
    JobsLast10Widget: JobsLast10Widget
  };
}

export default connect(mapStateToProps, null)(Dashboard);
