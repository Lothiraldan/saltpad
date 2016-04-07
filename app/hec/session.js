import React, {Component} from 'react';
import store from '../store';

export function SessionHEC(DecoratedComponent) {
    class SessionHEC extends Component {

        updateState = () => {
            console.log("Store", store);
            this.setState(store.get("session") || {});
        }

        componentWillMount = () => {
            this.updateState();
            store.select('session').on('update', this.updateState);
        }

        componentWillUnmount = () => {
            store.select('session').off(this.updateState);
        }

        render = () => {
            return <DecoratedComponent {...this.props} session={this.state} />;
        }
    }

    SessionHEC.displayName = `SessionHEC(${DecoratedComponent.displayName})`;

    return SessionHEC;
}
