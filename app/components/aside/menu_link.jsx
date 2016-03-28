import React from 'react';
import SessionStoreHEC from '../../login/hec';
import { Link } from 'react-router';
import gen_path from '../../path_utils';

class MenuLink extends React.Component {
    render() {

        return (
          <li className>
            <Link to={gen_path(this.props.link)}>
              <i className={`fa fa-${this.props.icon}`} />
              <span>{this.props.title}</span>
            </Link>
          </li>
        )
    }
}

export default MenuLink;
