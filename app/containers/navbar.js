import React, { Component } from 'react';
import { connect } from 'react-redux';
import NavBar from '../components/navbar';
import {signOutUser} from '../actions/user';
import _ from 'lodash';


const mapDispatchToProps = (dispatch) => {
  return {
   signOutUser: (event) => dispatch(signOutUser())
  };
};


export default connect(null, mapDispatchToProps)(NavBar);
