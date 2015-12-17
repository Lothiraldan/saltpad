import React from 'react';
import {If} from './templates';

export function HidingHEC(DecoratedComponent) {
  class HidingHEC extends React.Component {

      constructor(props, context) {
          super(props, context);
          this.state = {open: this.props.default_open};
      }

      onClick = (event) => {
          if(this.state.open == true) {
            this.setState({open: false});
          } else {
            this.setState({open: true});
          }
      }

      render() {
          if(this.state.open == false) {
              var chevron="fa fa-fw fa-chevron-right";
              var body=[];
          } else {
              var chevron="fa fa-fw fa-chevron-down";
              var body=this.props.children;
          }

          let chevron_control=<i className={chevron} onClick={this.onClick} style={{cursor: "pointer"}}></i>;

          return <DecoratedComponent {...this.props} hiding_control={chevron_control} open={this.state.open}></DecoratedComponent>;
      }
  }

  return HidingHEC;
}


class HidingPanelK extends React.Component {

    render() {
        let heading = this.props.heading;
        let status = this.props.status;
        let div_body = this.props.div_body;
        let className = `panel panel-default panel-${this.props.status}`;


        if(div_body === true || div_body === undefined) {
            var body = <div className="panel-body">{this.props.children}</div>;
        } else {
            var body = this.props.children;
        }

        return (
          <div className={className} id={heading}>
            <div className="panel-heading">
              <h3>
                {this.props.hiding_control} {heading}
              </h3>
            </div>
            <If condition={this.props.open}>
              {body}
            </If>
          </div>
        )
    }
}
export var HidingPanel = HidingHEC(HidingPanelK);
