import React from 'react'
import ReactDom from 'react-dom'
import {Router} from 'react-router'
import { Provider } from 'react-redux';
import routes from './routes'
import connect_ws from './services/real-time'
import browserHistory from './history'

import {store, history} from './store';

console.log("Store index", store);

function render(routes) {
    ReactDom.render(
      <Provider store={store}>
          <Router history={history} routes={routes} />
      </Provider>,
      document.getElementById('app')
    )
}

routes.then(routes => render(routes));
