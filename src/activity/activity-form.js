'use strict';

const React = require('react');

module.exports = React.createClass({

  onSubmit(event) {
    event.preventDefault();

  },

  render() {
    return (
      <form onSubmit={this.onSubmit}>
        <input type="text" name="activity.name" ref="name" />
        <button> Start Tracking </button>
      </form>
    )
  }

});
