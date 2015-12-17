import React from 'react';
import SessionStoreHEC from '../../login/hec';

class UserPart extends React.Component {
    render() {
        return (
            <h5 className="centered" style={{marginBottom: '25px'}}>Hello {this.props.user}</h5>
        )
    }
}

export default SessionStoreHEC(UserPart);
