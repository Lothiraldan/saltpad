import React from 'react';
import { Route } from 'react-router';
import axios from 'axios';
import _ from 'lodash';

import Main from './components/Main'
import Dashboard from './components/dashboard'
import JobHistory from './components/job_history'
import JobResult from './components/job_result'
import MinionList from './components/minion_list'
import JobRun from './components/job_run'
import JobTemplates from './components/job_templates'
import Login from './login/LoginComponent'
import loginRequired from './login/middleware'

// We need to specify the route handler twice
// to catch the case without option specified

export default axios.get('/static/settings.json')
    .then(result => result.data)
    .then(result => {
        function path_with_prefix(path) {
            let path_prefix = _.get(result, 'PATH_PREFIX', '');
            return `${path_prefix}${path}`;
        }

        return (
          <Route component={Main}>
            <Route path={path_with_prefix('/')} component={Dashboard} onEnter={loginRequired}/>
            <Route path={path_with_prefix('/login')} component={Login} />
            <Route path={path_with_prefix('/jobs')} component={JobHistory} onEnter={loginRequired}/>
            <Route path={path_with_prefix('/job_result/:job_id')} component={JobResult} onEnter={loginRequired}/>
            <Route path={path_with_prefix('/minions')} component={MinionList} onEnter={loginRequired}/>
            <Route path={path_with_prefix('/job/run')} component={JobRun} onEnter={loginRequired}/>
            <Route path={path_with_prefix('/job/templates')} component={JobTemplates} onEnter={loginRequired}/>
          </Route>
        )
    });
