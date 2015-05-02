'use strict';

import React from 'react';

export default React.createClass({

  getInitialState() {
    return {
      authenticated: Parse.User.current()
    }
  },

  connectDropbox() {
    if (!this.state.authenticated) {

    }
  },

  render() {
    let markup;
    let style = {
      display: this.state.authenticated ? 'none' : 'block',
      margin: '0 auto'
    };

    if (!this.state.authenticated) {
      markup = (
        <button
          style={style}
          onClick={this.connectDropbox}> Connect Your Dropbox </button>
      );
    } else {
      markup = (
        <button style={style}>
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
