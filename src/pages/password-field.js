'use strict';

import React from 'react';

const PasswordField = React.createClass({

  onPasswordKeyUp(event) {
    debugger;
  },

  render() {
    if (this.props.userFound) {
      return (
        <span>
          <input ref="password"
                 type="password"
                 onKeyUp={this.onPasswordKeyUp}
                 placeholder=" Password"/><br/>
        </span>
      );
    }
    else {
      return <span></span>;
    }
  }

});

export default PasswordField;
