import React from 'react';
import { Link } from 'react-router';

class JobCounterWidget extends React.Component {
    render() {

      return (
        <div className="col-md-3 col-sm-3 box0">
          <div className="box1">
            <span className="fa fa-tasks" />
            <h3>{_.size(this.props.jobs)}</h3>
          </div>
          <p>{_.size(this.props.jobs)} jobs.</p>
        </div>
      )
    }
}

export default JobCounterWidget;
