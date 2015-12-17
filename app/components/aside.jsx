import React from 'react';
import SessionStoreHEC from '../login/hec';
import UserPart from './aside/user';
import MenuLink from './aside/menu_link';

class Aside extends React.Component {
    render() {

      return (
        <aside>
          <div id="sidebar" className="nav-collapse ">
            <ul className="sidebar-menu" id="nav-accordion">

              <p className="centered"><a href="profile.html"><img className="img-circle" width="60"></img></a></p>
              <UserPart></UserPart>

              <MenuLink link="/" icon="dashboard" title="Dashboard"></MenuLink>

              <MenuLink link="/jobs" icon="tasks" title="Jobs"></MenuLink>

              <MenuLink link="/minions" icon="cubes" title="Minions"></MenuLink>

              <MenuLink link="/job/run" icon="play" title="Run job"></MenuLink>

              <MenuLink link="/job/templates" icon="magic" title="Jobs templates"></MenuLink>

            </ul>
          </div>
        </aside>
      )
    }
}

export default Aside;
