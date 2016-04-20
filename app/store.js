import React from 'react';
import Baobab from 'baobab';
import axios from 'axios';
import _ from 'lodash';

import {PushError, FatalError} from './errors/actions';

// Load tree
var local_state = localStorage.state;

if(local_state != undefined) {
    local_state = JSON.parse(localStorage.getItem("state"));
} else {
    local_state = {jobs: {}, minions: {}, auth: {}}
}

var tree = new Baobab(local_state);

window.store = tree;

// Save tree
window.addEventListener("beforeunload", function(e){
    let savedTree = _.pick(tree.get(), "auth", "session");
    localStorage.setItem("state", JSON.stringify(savedTree));
}, false);

export default tree;

class ExtendableError extends Error {
  constructor(message) {
    super(message);
    this.name = this.constructor.name;
    this.message = message;
    Error.captureStackTrace(this, this.constructor.name)
  }
}


class Fatal extends ExtendableError {
  constructor(message, details, fixes) {
    super(message);
    this.details = details;
    this.fixes = fixes;
  }
}

// Load settings
axios.get('/static/settings.json')
    .then(result => result.data)
    .then(settings => {
        if(!(settings instanceof Object)) {
            let message = "Invalid loaded settings.";
            let details = (<h3>Loaded settings was: <pre>{settings}</pre></h3>);
            let fixes = (
              <ul>
                <li><p>Check that the file settings.json doesn't includes comments anymore</p></li>
                <li><p>Check that <a href="/settings.json">the settings.json</a> served is the right one</p></li>
              </ul>
            );
            throw new Fatal(message, details, fixes);
        }
        return settings;
    })
    .then(settings => {
      window.settings = settings;
      tree.set("settings", settings)
    })
    .catch(response => {
        if (response instanceof Fatal) {
          // Something happened in setting up the request that triggered an Error
          FatalError(response);
        } else {
          if(response.status == 404) {
              let fixes = (
                <ul>
                  <li><p>Check that you have deployed a settings.json file on the server.</p></li>
                  <li><p>Check that the web server is configured for serving the settings.json file</p></li>
                  <li><p>Check that <a href="/settings.json">the settings.json</a> served is the right one</p></li>
                </ul>
              )
              let err = new Fatal('Settings was not found', undefined, fixes);
              FatalError(err);
          }
        }
    });


// Redux store
import { createStore, applyMiddleware, compose } from 'redux';
import rootReducer from './reducers';
import promiseMiddleware from 'redux-promise';
import { routerReducer, syncHistoryWithStore, routerActions, routerMiddleware } from 'react-router-redux'
import handleTransitions from 'redux-history-transitions';
import authenticatedApiCall from './middlewares/api';
import browserHistory from './history'

export function configureStore(browserHistory) {
  const transitions_enhancer = handleTransitions(browserHistory)
  const store = createStore(rootReducer, {}, compose(
    applyMiddleware(authenticatedApiCall),
    applyMiddleware(promiseMiddleware),
    applyMiddleware(routerMiddleware(browserHistory)),
    transitions_enhancer,
    window.devToolsExtension ? window.devToolsExtension() : f => f
  ));
  const history = syncHistoryWithStore(browserHistory, store);
  return {store: store, history: history}
};

export var {store, history} = configureStore(browserHistory);
