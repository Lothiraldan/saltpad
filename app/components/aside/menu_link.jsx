import React from 'react';
import SessionStoreHEC from '../../login/hec';
import { Link } from 'react-router';

class MenuLink extends React.Component {
    render() {

        return (
          <li className>
            <Link to={this.props.link}>
              <i className={`fa fa-${this.props.icon}`} />
              <span>{this.props.title}</span>
            </Link>
          </li>
        )
    }
}

export default MenuLink;
