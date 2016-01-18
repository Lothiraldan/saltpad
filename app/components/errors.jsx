import React from 'react';
import {If} from './shared/templates';

export class FatalError extends React.Component {
    render = () => {
        let fatal_error = this.props.fatal_error;

        return (
          <div>
            <div className="container">
              <div className="jumbotron">
                <h1><span className="glyphicon glyphicon-fire red"></span> A fatal error happened</h1>
                <p className="lead">Saltpad was unable to load because of the following fatal error.</p>
                <p className="lead">You need to fix the error before being able to use Saltpad,
                      reloading the page will not make it work.
                      See below for details and possible fixes.</p>
              </div>
            </div>
            <div className="container">
              <div className="body-content">
                <div className="row">
                  <div className="col-md-6">
                    <h2>What happened?</h2>
                    <p className="lead">{fatal_error.message}</p>

                    <If condition={fatal_error.details}>
                      <h2>Error details:</h2>
                      {fatal_error.details}
                    </If>
                  </div>
                  <div className="col-md-6">
                    <h2>What can I do?</h2>
                    <p className="lead">Possible fixes:</p>
                    {fatal_error.fixes}
                    <h2>Once fixed, you can reload the page</h2>
                    <a href="javascript:document.location.reload(true);" className="btn btn-default btn-lg text-center"><span className="green">Try This Page Again</span></a>
                 </div>
                </div>
              </div>
            </div>
          </div>
        )
    }
}
FatalError.displayName = "FatalError";


export class ErrorMessage extends React.Component {
    render = () => {
      return (
        <div className="alert alert-danger" role="alert">{this.props.message}</div>
      )
    }
}
ErrorMessage.displayName = "ErrorMessage";
