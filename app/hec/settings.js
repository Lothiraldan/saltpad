import React, {Component} from 'react';
import store from '../store';

export default function(DecoratedComponent) {
    class SettingsStoreHEC extends Component {

        constructor(props, context) {
            super(props, context);
            this.state = store.get('settings');
        }

        updateState = () => {
            this.setState(store.get('settings') || {});
        }

        componentWillMount = () => {
            this.mounted = true;
            store.select('settings').on('update', this.updateState);
        }

        componentWillUnmount = () => {
            store.select('settings').off(this.updateState);
        }

        render = () => {
            return <DecoratedComponent {...this.props} settings={this.state} />;
        }
    }

    SettingsStoreHEC.displayName = `SettingsStoreHEC(${DecoratedComponent.displayName})`;

    return SettingsStoreHEC;
}
