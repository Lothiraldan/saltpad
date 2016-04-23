import React, { Component } from 'react';
import { connect } from 'react-redux';
import MinionList from '../components/minion_list';


function mapStateToProps(state) {
  return {
    minions: state.minions,
  };
}

export default connect(mapStateToProps, null)(MinionList);
