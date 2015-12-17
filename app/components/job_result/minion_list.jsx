import React from 'react';
import { Link } from 'react-router';
import _ from 'lodash';
import moment from 'moment';

import JobsStoreHEC from '../../jobs/hec'
import {HighstateReturnParser, gradientBackground} from '../../jobs/utils';



// {% macro percent(n, tot) -%}
// {{ ((n / tot) * 100) }}
// {%- endmacro %}

// {% macro gradient_background(total, green, blue, yellow, red) -%}
// background: linear-gradient(to right, #d8ffc9, #d8ffc9 {{ percent(green, total) }}%
// {%- if blue -%}
// ,#d1f0ff {{ percent(green, total) }}%, #d1f0ff {{ percent(green + blue, total) }}%
// {%- endif %}
// {%- if yellow -%}
// ,#faebcc {{ percent(green + blue, total) }}%, #faebcc {{ percent(green + blue + yellow, total) }}%
// {%- endif -%}
// {%- if red -%}
// ,#ffd1d1 {{ percent(green + blue + yellow, total) }}%, #ffd1d1 {{ percent(green + blue + yellow + red, total) }}%
// {%- endif -%}
// );
// {%- endmacro %}



class MinionHighstateHeader extends React.Component {

  render() {
    let stateResult = HighstateReturnParser(this.props.job.Result[this.props.minion].return);
    let className = `list-group-item list-group-item-${stateResult.status}`;

    let background = gradientBackground(stateResult.chunks);
    console.log(background);

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
