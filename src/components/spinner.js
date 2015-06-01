'use strict';

import React from 'react';

const Spinner = React.createClass({

  render() {
    let klass;
    let spin = this.props.spin || false;

    klass = spin ? "fa fa-2x fa-refresh fa-spin" : "fa fa-2x fa-refresh";

    if (this.props.show) {
      return (
        <i className={klass}></i>
      );
    }
    else {
      return (<span></span>);
    }
  }
});

export default Spinner;
