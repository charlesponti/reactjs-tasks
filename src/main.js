'use strict';

import './dropbox-client.js';

var React = require('react');
var Router = require('react-router');
var App = require('./app');

// Initialize TouchEvents
React.initializeTouchEvents(true);

Router.run(App.routes, function (Handler) {
  React.render(<Handler/>, document.querySelector('#app'));
});

// Or, if you'd like to use the HTML5 history API for cleaner URLs:
// Router.run(routes, Router.HistoryLocation, function (Handler) {
//   React.render(<Handler/>, document.querySelector('app'));
// });
