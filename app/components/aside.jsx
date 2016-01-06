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

              <UserPart />

              <MenuLink link="/" icon="dashboard" title="Dashboard" />

              <MenuLink link="/jobs" icon="tasks" title="Jobs" />

              <MenuLink link="/minions" icon="cubes" title="Minions" />

              <MenuLink link="/job/run" icon="play" title="Run job" />

              <MenuLink link="/job/templates" icon="magic" title="Jobs templates" />

            </ul>
          </div>
        </aside>
      )
    }
}

export default Aside;
