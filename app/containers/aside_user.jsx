import React, { Component } from 'react';
import { connect } from 'react-redux';
import UserPart from '../components/aside/user';


function mapStateToProps(state) {
  return {
    user: state.user.user,
  };
};

export default connect(mapStateToProps, null)(UserPart);
