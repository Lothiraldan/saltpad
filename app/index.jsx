import React from 'react'
import ReactDom from 'react-dom'
import {Router} from 'react-router'
import { Provider } from 'react-redux';
import routes from './routes'
import connect_ws from './services/real-time'
import auto_updater from './services/auto_updater'
import browserHistory from './history'

import {configureStore} from './store';

var {store, history} = configureStore(browserHistory);

console.debug("Saltpad started!", store, history);

function render(routes) {
    ReactDom.render(
      <Provider store={store}>
          <Router history={history} routes={routes} />
      </Provider>,
      document.getElementById('app')
    )
}

routes.then(routes => render(routes));
