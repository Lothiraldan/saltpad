import React, { Component } from 'react'

class BaseHEC extends Component {


    componentWillMount = () => {
        console.log("This base ", this);
    }
}

export default BaseHEC;
