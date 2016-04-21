import React, { Component } from 'react';
import { connect } from 'react-redux';
import MinionCounterWidget from '../../components/dashboard/minion_counter';


function mapStateToProps(state) {
  return {
    minions: state.minions,
  };
};

export default connect(mapStateToProps, null)(MinionCounterWidget);
