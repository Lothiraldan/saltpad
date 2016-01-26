import axios from 'axios';
import {LoginUser} from './LoginActions';
import BaseService from '../services/base_service';
import {PushError} from '../errors/actions';
import store from '../store';
import _ from 'lodash';

class AuthService extends BaseService {

  login = (username, password) => {
    let eauth = _.get(store.get('settings'), 'EAUTH', 'pam');
    let query = this.post(['login'],
      {username, password, "eauth": eauth}
    );
    return this.handleAuth(query);
  }

  logout() {
    LoginActions.logoutUser();
  }

  handleAuth(loginPromise) {
    return loginPromise
      .then(response => {
        let _return = response.data.return[0];
        var token = _return.token;
        var user  = _return.user;
        LoginUser(token, user);
        return true;
      })
      .catch(response => {
        if(response instanceof Error) {
          PushError(response.message);
          throw response;
        }

        if(response.status == 401) {
          PushError('Invalid credentials');
          throw new Error('Invalid credentials');
        }

        let default_err_msg = `Error contacting the API at ${response.config.url._string}`;
        PushError(default_err_msg);
        throw new Error(default_err_msg);
      });
  }
}

export default new AuthService()
