'use strict';

import React from 'react';

export default React.createClass({

  onPasswordKeyUp(event) {
    if (event.keyCode == 13) {
      debugger;
    }
  },

  render() {
    if (this.props.userFound) {
      return (
        <fieldset>
          <label for="password">Password</label>
          <input ref="password"
                 type="password"
                 onKeyUp={this.onPasswordKeyUp}/>
        </fieldset>
      );
    }
    else {
      return <span></span>;
    }
  }

});
