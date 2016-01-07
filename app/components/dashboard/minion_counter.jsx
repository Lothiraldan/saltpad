import React from 'react';
import { Link } from 'react-router';
import MinionStoreHEC from '../../minions/hec';
import _ from 'lodash';

class MinionCounterWidget extends React.Component {
    render() {

      let minions = this.props.minions;
      let up_minions = _.filter(minions, (minion) => minion.status == 'up');

      if(_.size(minions) == _.size(up_minions) && _.size(minions) != 0) {
        var color = 'green';
      } else {
        var color = 'red';
      }

      return (
        <div className="col-md-3 col-sm-3 box0">
          <div className="box1">
            <span className="fa fa-cubes" style={{color: color}} />
            <h3>{_.size(up_minions)} / {_.size(minions)}</h3>
          </div>
          <p>On {_.size(minions)} minions detected on the platform, {_.size(up_minions)} minions were alive recently.</p>
        </div>
      )
    }
}

export default MinionStoreHEC(MinionCounterWidget);
