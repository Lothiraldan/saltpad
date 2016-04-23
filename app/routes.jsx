import React from 'react';
import { Route } from 'react-router';
import axios from 'axios';
import _ from 'lodash';

import Main from './pages/Main';
import Dashboard from './containers/dashboard';
import JobHistory from './containers/job_history';
import JobResult from './containers/job_result';
import MinionList from './containers/minion_list';
import JobRun from './components/job_run';
import JobTemplates from './containers/job_templates';
import Login from './pages/login';
import loginRequired, {UserIsAuthenticated} from './login/middleware';
import PageStructure from './components/PageStructure';

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
            <Route path={path_with_prefix('/login')} component={Login} />
            <Route path={path_with_prefix('/')} component={UserIsAuthenticated(PageStructure(Dashboard))} />
            <Route path={path_with_prefix('/jobs')} component={UserIsAuthenticated(PageStructure(JobHistory))} />
            <Route path={path_with_prefix('/job_result/:job_id')} component={UserIsAuthenticated(PageStructure(JobResult))} />
            <Route path={path_with_prefix('/minions')} component={UserIsAuthenticated(PageStructure(MinionList))} />
            <Route path={path_with_prefix('/job/run')} component={UserIsAuthenticated(PageStructure(JobRun))} />
            <Route path={path_with_prefix('/job/templates')} component={UserIsAuthenticated(PageStructure(JobTemplates))} />
          </Route>
        )
    });
