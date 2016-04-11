import React from 'react';
import SessionStoreHEC from '../../login/hec';

class UserPart extends React.Component {
    static propTypes = {
        user: React.PropTypes.object.isRequired,
    };

    render() {
        return (
            <h5 className="centered" style={{marginBottom: '25px'}}>Hello {this.props.user.username}</h5>
        )
    }
}

export default UserPart;
