import React from 'react'
import { Route } from 'react-router'

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

export default (
  <Route component={Main}>
    <Route path='/login' component={Login} />
    <Route path='/' component={Dashboard} onEnter={loginRequired}/>
    <Route path="/jobs" component={JobHistory} onEnter={loginRequired}/>
    <Route path="/job_result/:job_id" component={JobResult} onEnter={loginRequired}/>
    <Route path="/minions" component={MinionList} onEnter={loginRequired}/>
    <Route path="/job/run" component={JobRun} onEnter={loginRequired}/>
    <Route path="/job/templates" component={JobTemplates} onEnter={loginRequired}/>
  </Route>
)
