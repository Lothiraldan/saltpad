import React, { Component } from 'react';
import { connect } from 'react-redux';
import {LoginForm} from '../components/login';
import {signInUser, signInUserFailure, signInUserSuccess} from '../actions/user';
import gen_path from '../path_utils';
import _ from 'lodash';
import { reduxForm } from 'redux-form';

// TODO REMOVE
import {CleanErrors} from '../errors/actions';
import AuthService from '../services/login';
import history from '../history';


//Client side validation
function validate(values) {
  var errors = {};
  var hasErrors = false;
  if (!values.username || values.username.trim() === '') {
    errors.username = 'Enter username';
    hasErrors = true;
  }
  if(!values.password || values.password.trim() === '') {
    errors.password = 'Enter password';
    hasErrors = true;
  }
   return hasErrors && errors;
}


function mapStateToProps(state) {
  return {
    user_redux: state.user,
  };
};


function old_login(username, password, history, dispatch) {
    CleanErrors();
    AuthService.login(username, password)
      .then(logged => {
        if(logged) {
          dispatch(signUpUserSuccess({'token': logged[0], 'username': logged[1]}))
          let path = gen_path('/');
          history.pushState(null, path, null);
        }
    });
}


//For any field errors upon submission (i.e. not instant check)
const validateAndSignInUser = (values, dispatch) => {

  return new Promise((resolve, reject) => {
    dispatch(signInUser(values))
      .then((response) => {
        let data = response.payload.data;
        //if any one of these exist, then there is a field error
        if(response.payload.status != 200) {
          //let other components know of error by updating the redux` state
          dispatch(signInUserFailure(response.payload));
          reject({_error: "Invalid credentials"}); //this is for redux-form itself
        } else {
          let user_payload = {token: data.return[0].token, username: data.return[0].user}
          //let other components know that we got user and things are fine by updating the redux` state
          dispatch(signInUserSuccess(user_payload));
          resolve();//this is for redux-form itself
        }
    });
  });
};


const mapDispatchToProps = (dispatch) => {
  return {
   signInUser: validateAndSignInUser
  }
}
export default reduxForm({
  form: 'LoginForm',
  fields: ['username', 'password'],
  null,
  null,
  validate
}, mapStateToProps, mapDispatchToProps)(LoginForm);
