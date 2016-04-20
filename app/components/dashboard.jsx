import React, { PropTypes } from 'react';
import MinionKeysWidget from './dashboard/minion_keys';

class Dashboard extends React.Component {
    render() {

      let {
        MinionCounterWidget,
        JobCounterWidget,
        JobsLast10Widget
      } = this.props;

      return (
        <div className="row mtbox">
          <MinionCounterWidget />

          <MinionKeysWidget />

          <JobCounterWidget />

          <JobsLast10Widget />
        </div>
      )
    }
}

Dashboard.displayName = "Dashboard";

export default Dashboard;

