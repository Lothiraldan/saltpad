import React, { Component } from 'react';
import { connect } from 'react-redux';
import NavBar from '../components/navbar';
import {signOutUser} from '../actions/user';
import _ from 'lodash';


function localSignOutUser(dispatch, event) {
    dispatch(signOutUser());
}

const mapDispatchToProps = (dispatch) => {
  return {
   signOutUser: _.curry(localSignOutUser)(dispatch)
  }
}


export default connect(null, mapDispatchToProps)(NavBar);
