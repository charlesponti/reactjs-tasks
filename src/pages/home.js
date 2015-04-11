'use strict';

const React = require('react');
const dropbox = require('../dropbox-client');

export default React.createClass({

  getInitialState() {
    return {
      authenticated: dropbox.isAuthenticated()
    }
  },

  connectDropbox() {
    if (!this.state.authenticated) {
      dropbox.authenticate();
    }
  },

  render() {
    return (
      <section className="text-center home">
        <button
          style={{display: this.state.authenticated ? 'none' : 'block' }}
          onClick={this.connectDropbox}> Connect Your Dropbox </button>
      </section>
    )
  }

});
