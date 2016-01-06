import React from 'react';

export class If extends React.Component {
    render() {
        if(this.props.condition) {
            return <div>{this.props.children}</div>;
        } else {
            return <div />;
        }
    }
}

