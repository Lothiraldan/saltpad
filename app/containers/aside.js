import React, { Component } from 'react';
import { connect } from 'react-redux';
import UserPart from './aside_user';
import Aside from '../components/aside';


function mapStateToProps(state) {
  return {
    UserPart: UserPart,
  };
};

export default connect(mapStateToProps, null)(Aside);
