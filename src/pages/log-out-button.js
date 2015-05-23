'use strict';

import React from 'react';

const LogOut = React.createClass({

  /**
   * Log out user when button is clicked
   */
  onClick() {
    return Parse.User.logOut();
  },

  render() {
    return (
      <button onClick={this.onClick}> Log Out </button>
    );
  }

});

export default LogOut;
