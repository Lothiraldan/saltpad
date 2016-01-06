import React, {Component} from 'react';
import store from '../store';

export default function(DecoratedComponent) {
    class AuthStoreHEC extends Component {

        render = () => {
            return <DecoratedComponent {...this.props} {...store.get('auth')} />;
        }
    }

    return AuthStoreHEC;
}
