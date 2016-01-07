import React from 'react';
import { Link } from 'react-router';
import _ from 'lodash';

class MinionKeysWidget extends React.Component {
    render() {

      let accepted = 10;
      let pending = 4;
      let refused = 2;

      return (
        <div className="col-md-3 col-sm-3 box0">
          <div className="box1">
            <span className="fa fa-key" />
            <h3>
              <span style={{color: "green"}}>{accepted}</span> / <span style={{color: "orange"}}>{pending}</span> / <span style={{color: "red"}}>{refused}</span>
            </h3>
          </div>
          <p>{accepted} keys accepted, {pending} keys refused and {refused} keys refused.</p>
        </div>
      )
    }
}

export default MinionKeysWidget;
