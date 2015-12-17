import React from 'react';
import {LogoutUser} from '../login/LoginActions';
import { Link } from 'react-router';

export default class NavBar extends React.Component {
    render() {

      return (
        <header className="header black-bg">
          <div className="sidebar-toggle-box">
              <div className="fa fa-bars tooltips" data-placement="right" data-original-title="Toggle Navigation"></div>
          </div>

          <Link to="/" className="logo"><b>SALTPAD</b></Link>

          <div className="nav notify-row" id="top_menu">
            <ul className="nav top-menu">
              <li className="dropdown">
                <a href="/"><i className="fa fa-dashboard"><span> Dashboard</span></i></a>
              </li>

              <li className="dropdown">
                <a href="/"><i className="fa fa-tasks"><span> Jobs</span></i></a>
              </li>

              <li className="dropdown">
                <a href="/"><i className="fa fa-cubes"><span> Minions</span></i></a>
              </li>




                      <li id="header_inbox_bar" className="dropdown">
                          <a data-toggle="dropdown" className="dropdown-toggle" href="#">
                              <i className="fa fa-envelope-o"></i>
                              <span className="badge bg-theme">5</span>
                          </a>
                          <ul className="dropdown-menu extended inbox">
                              <div className="notify-arrow notify-arrow-green"></div>
                              <li>
                                  <p className="green">You have 5 new messages</p>
                              </li>
                              <li>
                                  <a href="#">
                                      <span className="photo"><img alt="avatar"></img></span>
                                      <span className="subject">
                                      <span className="from">Zac Snider</span>
                                      <span className="time">Just now</span>
                                      </span>
                                      <span className="message">
                                          Hi mate, how is everything?
                                      </span>
                                  </a>
                              </li>
                              <li>
                                  <a href="#">
                                      <span className="photo"><img alt="avatar"></img></span>
                                      <span className="subject">
                                      <span className="from">Divya Manian</span>
                                      <span className="time">40 mins.</span>
                                      </span>
                                      <span className="message">
                                       Hi, I need your help with this.
                                      </span>
                                  </a>
                              </li>
                              <li>
                                  <a href="#">
                                      <span className="photo"><img alt="avatar"></img></span>
                                      <span className="subject">
                                      <span className="from">Dan Rogers</span>
                                      <span className="time">2 hrs.</span>
                                      </span>
                                      <span className="message">
                                          Love your new Dashboard.
                                      </span>
                                  </a>
                              </li>
                              <li>
                                  <a href="#">
                                      <span className="photo"><img alt="avatar"></img></span>
                                      <span className="subject">
                                      <span className="from">Dj Sherman</span>
                                      <span className="time">4 hrs.</span>
                                      </span>
                                      <span className="message">
                                          Please, answer asap.
                                      </span>
                                  </a>
                              </li>
                              <li>
                                  <a href="#">See all messages</a>
                              </li>
                          </ul>
                      </li>
                  </ul>
              </div>

            <div className="top-menu">
              <ul className="nav pull-right top-menu">
                    <li><a className="logout" onClick={LogoutUser}>Logout</a></li>
              </ul>
            </div>
          </header>
        )
    }
}
