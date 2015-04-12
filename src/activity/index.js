'use strict';

const React = require('react');
const ActivityForm = require('./activity-form');
const ActivityList = require('./activity-list');

module.exports = React.createClass({

  render() {
    return (
      <div>
        <h3 className="text-center"> Activity </h3>
        <ActivityForm />
        <ActivityList />
      </div>
    )
  }

});

