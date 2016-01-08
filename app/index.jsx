import React from 'react'
import ReactDom from 'react-dom'
import {Router} from 'react-router'
import routes from './routes'
import connect_ws from './services/real-time'
import auto_updater from './services/auto_updater'
import history from './history'

function render() {
    ReactDom.render(
      <Router history={history} >
        {routes}
      </Router>,
      document.getElementById('app')
    )
}

render();
