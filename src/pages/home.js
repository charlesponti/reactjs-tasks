'use strict';

import React from 'react';
import SignUp from './sign-up.js';

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
