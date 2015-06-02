'use strict';

import React from 'react';

const PasswordField = React.createClass({

  onPasswordKeyUp(event) {
    if (event.keyCode == 13) {
      debugger;
    }
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
