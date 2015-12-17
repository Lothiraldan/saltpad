import axios from 'axios';
import {LoginUser} from './LoginActions';
import BaseService from '../services/base_service';

class AuthService extends BaseService {

  login = (username, password) => {
    let query = this.post(['login'],
      {username, password, "eauth": "pam"}
    );
    return this.handleAuth(query);
  }

  logout() {
    LoginActions.logoutUser();
  }

  handleAuth(loginPromise) {
    return loginPromise
      .then(function(response) {
        let _return = response.data.return[0];
        var token = _return.token;
        var user  = _return.user;
        LoginUser(token, user);
        return true;
      });
  }
}

export default new AuthService()
