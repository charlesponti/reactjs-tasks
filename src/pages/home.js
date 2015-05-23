'use strict';

import React from 'react';
import SignUp from './sign-up.js';
import LogOut from './log-out-button.js';

export default React.createClass({

  getInitialState() {
    return {
      authenticated: Parse.User.current()
    }
  },

  render() {
    let markup;

    if (!this.state.authenticated) {
      markup = <SignUp/>;
    } else {
      // Render log out button to navigation
      React.render(<LogOut/>, document.querySelector('#log-out'));

      markup = (
        <button>
          <a href="#/tasks">Tasks</a>
        </button>
      )
    }

    return (
      <section className="text-center home">
        {markup}
      </section>
    )
  }

});
