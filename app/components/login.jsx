import React from 'react';
import LinkedStateMixin from 'react-addons-linked-state-mixin';
import ReactMixin from 'react-mixin';
import {CleanErrors} from '../errors/actions';
import {ErrorStoreHec} from '../errors/hec';
import {ErrorMessage} from './errors';
import gen_path from '../path_utils';
import _ from 'lodash';

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
    this.props.validateAndSignInUser(this.state.username, this.state.password, this.context.history);
  }

  render() {

    let errors = _.map(this.props.errors, (error, index) => <ErrorMessage message={error} key={index}/>);

    return (
      <div style={{marginTop: "50px"}} className="mainbox col-md-6 col-md-offset-3 col-sm-8 col-sm-offset-2">

        {errors}

        <div className="panel panel-info" >
          <div className="panel-heading">
              <div className="panel-title">SaltPad</div>
          </div>

          <div style={{paddingTop: "30px"}} className="panel-body">

            <form id="loginform" className="form-horizontal" role="form" onSubmit={handleSubmit(this.props.signInUser.bind(this))}>
              <div style={{marginBotton: "25px"}} className="input-group">
                <span className="input-group-addon"><i className="fa fa-fw fa-user" /></span>
                <input id="login-username" type="text" className="form-control" name="username" placeholder="username" valueLink={this.linkState('username')} />
              </div>

              <div style={{marginBotton: "25px"}} className="input-group">
                <span className="input-group-addon"><i className="fa fa-fw fa-key" /></span>
                <input id="login-password" type="password" className="form-control" name="password" placeholder="password" valueLink={this.linkState('password')} />
              </div>

              <div style={{marginTop: "10px"}} className="form-group">
                <div className="col-sm-12 controls">
                  <input type="submit" value="Login" className="btn btn-success">
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
export default ErrorStoreHec(Login);

ReactMixin(Login.prototype, LinkedStateMixin);

export class LoginForm extends React.Component {
  render() {
    const {asyncValidating, fields: {username, password}, handleSubmit, submitting, user } = this.props;

    return (
      <div style={{marginTop: "50px"}} className="mainbox col-md-6 col-md-offset-3 col-sm-8 col-sm-offset-2">

        <div className="panel panel-info" >
          <div className="panel-heading">
              <div className="panel-title">SaltPad</div>
          </div>

          <div style={{paddingTop: "30px"}} className="panel-body">

            <form id="loginform" className="form-horizontal" role="form" onSubmit={handleSubmit(this.props.signInUser.bind(this))}>
              <div style={{marginBotton: "25px"}} className="input-group">
                <span className="input-group-addon"><i className="fa fa-fw fa-user" /></span>
                <input id="login-username" type="text" className="form-control" name="username" placeholder="username" {...username} />
              </div>

              <div style={{marginBotton: "25px"}} className="input-group">
                <span className="input-group-addon"><i className="fa fa-fw fa-key" /></span>
                <input id="login-password" type="password" className="form-control" name="password" placeholder="password" {...password} />
              </div>

              <div style={{marginTop: "10px"}} className="form-group">
                <div className="col-sm-12 controls">
                  <input type="submit" value="Login" className="btn btn-success">
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
