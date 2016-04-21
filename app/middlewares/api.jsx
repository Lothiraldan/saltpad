import axios from 'axios';
import URI from 'urijs';

export function apiCallAction(types, url, method='get', data={}, authenticated=True, additionalSuccessPayload={}) {
  function action() {
    return {
      type: "api_call",
      payload: {
        types: types,
        url: url,
        method: method,
        data: data,
        authenticated: authenticated,
        additionalSuccessPayload: additionalSuccessPayload
      }
    }
  }
  return action;
}


/*
This below is the format the middleware accepts.
{
  types: [ACT_LOGIN_PENDING, ACT_LOGIN_SUCCESS, ACT_LOGIN_ERROR],
  url: '/auth/login',
  method: 'post',
  query: {'ajax': true},
  data: {username, password}
}
*/

export default function authenticatedApiCall({getState}) {
  return next => action => {
    // If its not an core-app async action, pass next.
    if(action.type !== 'api_call') {
      return next(action);
    }

    var [pendingType, successType, errorType] = action.payload.types;

    var {
      url,
      method = 'get',
      query = {},
      data = undefined,
      headers = {},
      authenticated = true,
      additionalSuccessPayload = {}
    } = action.payload;

    if(authenticated === true) {
      headers["X-Auth-Token"] = getState().user.user.token;
    }

    if(data !== undefined) { // Be carefull about comparison
      data["Content-Type"] = "application/json";
    }

    let settings = window.settings;

    let baseURL = URI("")
            .host(settings.API_URL)
            .scheme(`${settings.SECURE_HTTP ? 'https' : 'http'}`);

    let AXIOS_INSTANCE = axios.create({
      baseURL: baseURL.toString(),
    });

    let QUERY = AXIOS_INSTANCE.request({
      method: method,
      url: url,
      headers: headers,
      data: data
    });

    // Dispatch the pending action
    next({
      type: pendingType,
      payload: {}
    });

    QUERY.then((response) => {
      // If something went wrong
      if(response.status != 200) {
        next({
          type: errorType,
          payload: response
        });
      }

      // If everything went good
      let action = {
        type: successType,
        payload: response
      };
      next({
        ...action,
        ...additionalSuccessPayload
      });
    })
    .catch((reason) => {
      next({
          type: errorType,
          payload: reason
        });
    });

  };
}
