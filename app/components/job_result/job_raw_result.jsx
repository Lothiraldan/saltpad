import React from 'react';
import { Link } from 'react-router';
import _ from 'lodash';
import JobsStoreHEC from '../../jobs/hec'
import moment from 'moment';
import {HidingPanel} from '../shared/hiding';

export class RawResultMinion extends React.Component  {
    render() {
        let minion = this.props.minion;
        let job_data = this.props.job_data;
        let job_return = job_data.return;

        if(_.isString(job_return)) {
            var job_output = job_data.return;
        } else {
            var job_output = JSON.stringify(job_data.return);
        }

        return (
          <HidingPanel heading={minion} status={status} default_open={true}>
            <pre>{job_output}</pre>
          </HidingPanel>
        );
    }
}
