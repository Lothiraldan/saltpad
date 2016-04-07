import React from 'react';
import { Component } from 'react';
import MainContainer from '../containers/Main';

export default class MainPage extends Component {
  render() {
    return (
        <MainContainer>
         {this.props.children}
        </MainContainer>
    );
  }
}
