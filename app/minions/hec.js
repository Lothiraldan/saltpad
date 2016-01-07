import React, {Component} from 'react';
import store from '../store';
import {ListMinions} from './actions';

export default function(DecoratedComponent) {
    class MinionsStoreHEC extends Component {

        constructor(props, context) {
            super(props, context);
            this.state = store.get('minions');
        }

        updateState = () => {
            this.setState(store.get('minions'));
        }

        componentWillMount = () => {
            this.mounted = true;
            store.select('minions').on('update', this.updateState);
        }

        componentWillUnmount = () => {
            store.select('minions').off(this.updateState);
        }

        render = () => {
            return <DecoratedComponent {...this.props} minions={this.state} />;
        }
    }

    MinionsStoreHEC.displayName = `MinionsStoreHEC(${DecoratedComponent.displayName})`;

    return MinionsStoreHEC;
}
