import {HidingPanel} from '../shared/hiding';
import React from 'react';

export default class JobEmptyResult extends React.Component {
    render() {

        let heading = this.props.minion;
        let status = "danger";

        return (
            <HidingPanel heading={heading} status={status} default_open={true}>
              <p>No return for this minion, minion is down or return is not yet available</p>
            </HidingPanel>
        )
    }
}
