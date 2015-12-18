import React from 'react';
import { Link } from 'react-router';
import _ from 'lodash';
import moment from 'moment';

import JobsStoreHEC from '../../jobs/hec'
import {HighstateReturnParser, gradientBackground} from '../../jobs/utils';



class MinionHighstateHeader extends React.Component {

  render() {
    let stateResult = HighstateReturnParser(this.props.job.Result[this.props.minion].return);
    let className = `list-group-item list-group-item-${stateResult.status}`;

    let background = gradientBackground(stateResult.chunks);

    return (
      <li key={this.props.minion} className="list-group-item" style={background}>{this.props.minion}</li>
    );
  }

}

class MinionHeader extends React.Component {

  render() {
    return <li key={this.props.minion} className="list-group-item">{this.props.minion}</li>;
  }

}


class MinionList extends React.Component {
    render() {

      let job = this.props.job;

      var minions_list = _.map(job.Minions, function(minion) {
          if(_.has(job.Result, minion)) {

              if(job.Function == 'state.highstate') {
                return <MinionHighstateHeader minion={minion} job={job}></MinionHighstateHeader>;
              } else {
                return <MinionHeader minion={minion}></MinionHeader>
              }
          } else {
              return <li key={minion} className="list-group-item list-group-item-warning">
                <span className="badge">
                  <i className="fa fa-spinner fa-spin">
                  </i>
                </span>
                {minion} (pending)
              </li>;
          }
      });

      return (
        <ul className="list-group">
          {minions_list}
        </ul>
      )
  }
}

export default MinionList;
