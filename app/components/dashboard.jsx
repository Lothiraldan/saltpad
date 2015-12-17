import _ from 'lodash';
import React, { PropTypes } from 'react'
import SessionStoreHEC from '../login/hec'
import JobsStoreHEC from '../jobs/hec'
import MinionsStoreHEC from '../minions/hec';
import JobCounterWidget from './dashboard/job_counter';
import JobsLast10Widget from './dashboard/job_last_10';
import MinionCounterWidget from './dashboard/minion_counter';
import MinionKeysWidget from './dashboard/minion_keys';

class Dashboard extends React.Component {
    render() {

      let minions = [];
      for (let minion_id in this.props.minions) {
          minions.push(<li key={minion_id}>{minion_id}, state "{this.props.minions[minion_id].status}"</li>);
      }

      let minion_number = _.size(this.props.minions);

      return (
        <div className="row mtbox">
          <MinionCounterWidget></MinionCounterWidget>

          <MinionKeysWidget></MinionKeysWidget>

          <JobCounterWidget></JobCounterWidget>

          <JobsLast10Widget></JobsLast10Widget>
        </div>
      )
    }
}

Dashboard.displayName = "Dashboard";

export default Dashboard;

