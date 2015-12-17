import React from 'react';
import LinkedStateMixin from 'react-addons-linked-state-mixin';
import ReactMixin from 'react-mixin';
import AuthService from './AuthService';

class Login extends React.Component {

  constructor(props, context) {
    super(props, context);
    this.state = {
      username: '',
      password: ''
    };
  }

  login(e) {
    e.preventDefault();
    AuthService.login(this.state.username, this.state.password)
      .then(logged => {
        if(logged) {
          this.context.history.pushState(null, '/', null);
        }
      });
  }

  render() {
    return (
      <div style={{marginTop: "50px"}} className="mainbox col-md-6 col-md-offset-3 col-sm-8 col-sm-offset-2">
        <div className="panel panel-info" >
          <div className="panel-heading">
              <div className="panel-title">SaltPad</div>
          </div>

          <div style={{paddingTop: "30px"}} className="panel-body" >

            <form id="loginform" className="form-horizontal" role="form">
              <div style={{marginBotton: "25px"}} className="input-group">
                <span className="input-group-addon"><i className="fa fa-fw fa-user"></i></span>
                <input id="login-username" type="text" className="form-control" name="username" placeholder="username" valueLink={this.linkState('username')}></input>
              </div>

              <div style={{marginBotton: "25px"}} className="input-group">
                <span className="input-group-addon"><i className="fa fa-fw fa-key"></i></span>
                <input id="login-password" type="password" className="form-control" name="password" placeholder="password" valueLink={this.linkState('password')}></input>
              </div>

              <div style={{marginTop: "10px"}} className="form-group">
                <div className="col-sm-12 controls">
                  <input type="submit" value="Login" className="btn btn-success" onClick={this.login.bind(this)}>
                  </input>
                </div>
              </div>
            </form>

          </div>
        </div>
      </div>
    );
  }
}
Login.contextTypes = {
  location: React.PropTypes.object.isRequired,
  history: React.PropTypes.object.isRequired
}
export default Login;

ReactMixin(Login.prototype, LinkedStateMixin);
