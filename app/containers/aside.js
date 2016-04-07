import React, { Component } from 'react';
import { connect } from 'react-redux';
import Aside from '../components/aside';
import _ from 'lodash';


function mapStateToProps(state) {
  return {
    user: state.user.user,
  };
};

export default connect(mapStateToProps, null)(Aside);
