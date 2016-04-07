import React, { Component } from 'react';
import { connect } from 'react-redux';
import Main from '../components/Main';


function mapStateToProps(state) {
  return {
    user_redux: state.user,
  };
};


export default connect(mapStateToProps, null)(Main);
