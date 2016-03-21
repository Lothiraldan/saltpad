import React from 'react';
import Baobab from 'baobab';
import axios from 'axios';
import _ from 'lodash';

import {PushError, FatalError} from './errors/actions';


// Facets

let facets = {non_runner_jobs: {
    cursors: {jobs: ['jobs']},
    get: function(data) {
        //
    }
}}

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
    .then(settings => tree.set("settings", settings))
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
