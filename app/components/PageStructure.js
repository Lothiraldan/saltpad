import React, { PropTypes } from 'react';
import Login from './login';
import NavBar from '../containers/navbar';
import Notification from '../components/notification';
import Aside from '../containers/aside';
import SettingsStoreHEC from '../hec/settings';
import {FatalErrorStoreHEC} from '../errors/hec';
import _ from 'lodash';
import {FatalError} from '../components/errors';

export default function page_structure(DecoratedComponent) {

  class PageStructure extends React.Component {

    render = () => {

      var navbar = <NavBar />;
      var aside = <Aside />;
      var notification = <Notification />;

      return (
        <div>
          {navbar}
          {aside}

          <section id="main-content">
            <section className="wrapper">
              <div className="row">
                <div className="col-lg-9">
                  <DecoratedComponent {...this.props} />
                </div>
                <div className="col-lg-3">
                  {notification}
                </div>
              </div>
            </section>
          </section>
        </div>
      )
    }
  }
  PageStructure.displayName = "Main";

  return PageStructure;
}
