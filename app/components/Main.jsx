import React, { PropTypes } from 'react';
import Login from '../login/LoginComponent';
import NavBar from '../components/navbar';
import Notification from '../components/notification';
import Aside from '../components/aside';
import SettingsStoreHEC from '../hec/settings';


// Styles
import {bootstrap} from '../../bower_components/bootstrap/dist/css/bootstrap.css';
import {font_awesome} from '../../bower_components/font-awesome/css/font-awesome.css';
import {responsive} from '../assets/css/style-responsive.css';
import {style} from '../assets/css/style.css';
import store from '../store';

class Main extends React.Component {

  render = () => {
    let settings = this.props.settings;

    if (settings == undefined) {
        return <div></div>;
    }

    let login_children = this.props.children.type == Login;

    if(login_children == true) {
        var navbar = undefined;
        var aside = undefined;
        var notification = undefined;
    } else {
        var navbar = <NavBar></NavBar>;
        var aside = <Aside></Aside>;
        var notification = <Notification></Notification>;
    }

    return (
      <div>
        {navbar}
        {aside}

        <section id="main-content">
          <section className="wrapper">
            <div className="row">
              <div className="col-lg-9">
                {this.props.children}
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

export default SettingsStoreHEC(Main);
