import React from 'react';
import {LogoutUser} from '../login/LoginActions';
import { Link } from 'react-router';
import gen_path from '../path_utils';

export default class NavBar extends React.Component {
    render() {

      return (
        <header className="header black-bg">
          <div className="sidebar-toggle-box">
              <div className="fa fa-bars tooltips" data-placement="right" data-original-title="Toggle Navigation" />
          </div>

          <Link to={gen_path("/")} className="logo"><b>SALTPAD</b></Link>

          <div className="top-menu">
            <ul className="nav pull-right top-menu">
                  <li><a className="logout" onClick={LogoutUser}>Logout</a></li>
            </ul>
          </div>
        </header>
      )
    }
}
