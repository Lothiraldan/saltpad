import _ from 'lodash';
import React, { PropTypes } from 'react'
import MinionsStoreHEC from '../minions/hec';
import {ModuleFunctionsStoreHEC, ModuleFunctionStoreHEC} from '../jobs/hec';
import {ReactBootstrapTableStyle} from '../../node_modules/react-bootstrap-table/css/react-bootstrap-table.min.css';
import {ReactSelectStyle} from '../../node_modules/react-select/dist/react-select.css'
import moment from 'moment';
import { Link } from 'react-router';
import Select from 'react-select';
import {HidingPanel} from './shared/hiding';
import {If} from './shared/templates';
import JobsService from '../jobs/services';
import {RunJob} from '../jobs/actions';
import gen_path from '../path_utils';

class MatcherSelect extends React.Component {

  render() {

    return (
      <div className="form-group">
        <label htmlFor="form-matcher-name" className="col-sm-2 control-label">Matcher</label>
        <div className="col-sm-10">
          <Select
              name="form-matcher-name"
              options={this.props.matchers}
              searchable={true}
              placeholder={'Glob'}
              value={this.props.matcher}
              onChange={this.props.matcherChanger}
          />
          <span className="help-block">
            The matcher of the job
          </span>
        </div>
      </div>
    )
  }
}

class TargetSelect extends React.Component {

  render() {

    return (
      <div className="form-group">
        <label htmlFor="form-target-name" className="col-sm-2 control-label">Minion</label>
        <div className="col-sm-10">
          <Select
              name="form-target-name"
              options={this.props.minions}
              searchable={true}
              addLabelText={'{label}'}
              value={this.props.target}
              onChange={this.props.targetChanger}
          />
          <span className="help-block">
            The target of the job
          </span>
        </div>
      </div>
    )
  }
}

class FunctionSelect extends React.Component {

  render() {

    var fonctions = this.props.functions;

    var async_options = (input, callback) => {
        console.log("Job Input", input);

        let options = _.filter(fonctions, (fonction) => _.includes(fonction.value, input));
        console.log("Options", options);
        callback(null, {
            options: options,
            // CAREFUL! Only set this to true when there are no more options,
            // or more specific queries will not be sent to the server.
            complete: false
        });
    }

    console.log("Function", this.props.function);
    var cache = [{label: this.props.function, value: this.props.function}];
    console.log("Cache", cache);

    return (
      <div className="form-group">
        <label htmlFor="form-function-name" className="col-sm-2 control-label">Function</label>
        <div className="col-sm-10">
          <Select.Async
              name="form-function-name"
              loadOptions={async_options}
              minimumInput={3}
              value={this.props.function}
              onChange={this.props.functionChanger}
          />
          <span className="help-block">
            The function of the job
          </span>
        </div>
      </div>
    )
  }
}

class JobDoc extends React.Component {

  render() {

    if(this.props.moduleFunctionName == undefined) {
      return <p>Select a function first to see its doc</p>
    }

    if(this.props.moduleFunction.doc == undefined) {
      return <pre><i className="fa fa-refresh fa-spin" /> Loading function doc</pre>;
    }

    return (
      <pre id="module_function_doc" style={{"wordWrap": "initial"}}>{this.props.moduleFunction.doc}</pre>
    )
  }

}

class JobArgInput extends React.Component {
  render() {

    let name = `form-arg-${this.props.arg_name}-name`;

    return (
      <div className="form-group">
        <label htmlFor={name} className="col-sm-2 control-label">{this.props.arg_name}</label>
        <div className="col-sm-10">
          <input name={name} className="form-control" value={this.props.arg_value}
            onChange={this.props.ArgumentChanger} key={this.props.arg_name} required={true}>
          </input>
        </div>
      </div>
    )
  }
}

class JobArguments extends React.Component {

  render() {

    if(this.props.moduleFunctionName == undefined) {
      return <span />;
    }

    if(this.props.moduleFunction.argspec == undefined) {
      return <span><i className="fa fa-refresh fa-spin" /> Loading function arguments</span>;
    }

    let [mandatory, optional] = this.props.moduleFunction.argspec;
    let ArgumentChanger = this.props.ArgumentChanger;
    let form_state = this.props.form_state;

    let mandatory_inputs = _.map(mandatory, (arg_name) => {
      return <JobArgInput arg_name={arg_name} key={arg_name} arg_value={_.get(form_state, arg_name)} ArgumentChanger={ArgumentChanger(arg_name)} />;
    });

    let optional_inputs = _.map(_.toPairs(optional), ([arg_name, arg_value]) => {
      return <JobArgInput arg_name={arg_name} arg_value={_.get(form_state, arg_name, arg_value)} key={arg_name} ArgumentChanger={ArgumentChanger(arg_name)} />;
    });

    return (
      <div>
        {mandatory_inputs}

        <If condition={_.size(optional_inputs)}>
          <HidingPanel heading={"Optional arguments"} status={status} default_open={false}>
            {optional_inputs}
          </HidingPanel>
        </If>
      </div>
    )
  }

}


class JobRun extends React.Component {

    constructor(props, context) {
        super(props, context);

        // If we want to copy an existing job, initialize state to job params
        if(_.get(this.props.location.state, "copy_job") != undefined) {
          let job = this.props.location.state.copy_job;
          this.state = {"matcher": job['Target-type'], "target": job['Target'],
                        "moduleFunction": job['Function'], "arguments": job['Arguments']}
        } else {
          this.state = {"matcher": "glob", "target": undefined,
                        "moduleFunction": undefined, "arguments": {}};
        }

        this.function_args_cache = {};
        this.function_doc_cache = {};
    }

    runJob = (e) => {
        e.preventDefault();

        let state = this.state;
        RunJob(state.matcher, state.target, state.moduleFunction, [[], state.arguments])
          .then(job_id => {
            if(job_id) {
              this.context.history.pushState(null, gen_path(`/job_result/${job_id}`), null);
            }
          });
    }

    render() {

      var matchers = [
          { value: 'glob', label: 'Glob'},
          { value: 'pcre', label: 'Perl regular expression'},
          { value: 'list', label: 'List'},
          { value: 'grain', label: 'Grain'},
          { value: 'grain_pcre', label: 'Grain perl regex'},
          { value: 'pillar', label: 'Pillar'},
          { value: 'nodegroup', label: 'Nodegroup'},
          { value: 'range', label: 'Range'},
          { value: 'compound', label: 'Compound'}
      ]

      var minions = _.map(_.keys(this.props.minions), (minion) => {
          return {value: minion, label: minion}
      });

      var moduleFunctions = _.map(_.toPairs(this.props.moduleFunctions), ([module_name, _]) => {
          return {value: module_name, label: module_name}
      });
      var moduleFunctions = _.sortBy(moduleFunctions, (module_name) => module_name.value);

      var matcherChanger = (value) => this.setState({matcher: _.get(value, "value")});
      var targetChanger = (value) => this.setState({target: _.get(value, "value")});
      var functionChanger = (value) => this.setState({moduleFunction: _.get(value, "value")});


      // Function doc && args
      let moduleFunctionName = this.state.moduleFunction;

      if(this.function_doc_cache[moduleFunctionName] == undefined) {
          this.function_doc_cache[moduleFunctionName] = ModuleFunctionStoreHEC(JobDoc, moduleFunctionName, true);
      }
      let FunctionDoc = this.function_doc_cache[moduleFunctionName];

      if(this.function_args_cache[moduleFunctionName] == undefined) {
          this.function_args_cache[moduleFunctionName] = ModuleFunctionStoreHEC(JobArguments, moduleFunctionName, false, true);
      }
      let FunctionArguments = this.function_args_cache[moduleFunctionName];

      let ArgumentChanger = (arg_name) => {
          return (event) => {
            this.setState({arguments: {[arg_name]: event.target.value}});
          };
      }

      return (
        <div>
          <h1>Run Job</h1>
          <div className="row">

            <div className="col-md-5">
              <div className="form-panel">
                <form className="form-horizontal style-form">


                  <MatcherSelect matcher={this.state.matcher} matchers={matchers}
                    matcherChanger={matcherChanger} />

                  <TargetSelect target={this.state.target} minions={minions}
                    targetChanger={targetChanger} />

                  <FunctionSelect function={this.state.moduleFunction} functions={moduleFunctions}
                    functionChanger={functionChanger} />

                  <FunctionArguments ArgumentChanger={ArgumentChanger} form_state={this.state.arguments} key="FunctionArguments" />

                  <div className="form-group">
                    <div className="col-sm-12 controls">
                      <input type="submit" value="Run Job" className="btn btn-success" onClick={this.runJob}>
                      </input>
                    </div>
                  </div>

                </form>
              </div>
            </div>

            <div className="col-md-7">
              <FunctionDoc key="FunctionDoc" />
            </div>

          </div>
        </div>
      )
    }
}

JobRun.displayName = "JobRun";

JobRun.contextTypes = {
  history: React.PropTypes.object.isRequired
}

export default ModuleFunctionsStoreHEC(MinionsStoreHEC(JobRun));

