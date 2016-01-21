import React, {Component} from 'react';
import store from '../store';

export function FatalErrorStoreHEC(DecoratedComponent, FatalErrorComponent) {
    class FatalErrorStoreHEC extends Component {

        constructor(props, context) {
            super(props, context);
            this.state = {'fatal_error': store.get('fatal_error')};
        }

        updateState = () => {
            this.setState({'fatal_error': store.get('fatal_error') || null});
        }

        componentWillMount = () => {
            this.mounted = true;
            store.select('fatal_error').on('update', this.updateState);
        }

        componentWillUnmount = () => {
            store.select('fatal_error').off(this.updateState);
        }

        render = () => {
            if(this.state && this.state.fatal_error) {
                var children = <FatalErrorComponent {...this.props} fatal_error={this.state.fatal_error} />;
            } else {
                var children = <DecoratedComponent {...this.props} />;
            }

            return children;
        }
    }

    FatalErrorStoreHEC.displayName = `FatalErrorStoreHEC(${DecoratedComponent.displayName}, ${FatalErrorComponent.displayName})`;

    return FatalErrorStoreHEC;
}

export function ErrorStoreHec(DecoratedComponent) {
    class ErrorStoreHec extends Component {

        constructor(props, context) {
            super(props, context);
            this.state = {'errors': store.get('errors') || []};
        }

        updateState = () => {
            this.setState({'errors': store.get('errors') || []});
        }

        componentWillMount = () => {
            this.mounted = true;
            store.select('errors').on('update', this.updateState);
        }

        componentWillUnmount = () => {
            store.select('errors').off(this.updateState);
        }

        render = () => {
            return <DecoratedComponent {...this.props} errors={this.state.errors}/>;
        }
    }

    ErrorStoreHec.displayName = `ErrorStoreHec(${DecoratedComponent.displayName})`;

    return ErrorStoreHec;
}
