'use strict';

var React = require('react');

// Initialize TouchEvents
React.initializeTouchEvents(true);

var Router = require('react-router');
var App = require('./app');

Router.run(App.routes, function (Handler) {
  React.render(<Handler/>, document.querySelector('#app'));
});

// Or, if you'd like to use the HTML5 history API for cleaner URLs:
// Router.run(routes, Router.HistoryLocation, function (Handler) {
//   React.render(<Handler/>, document.querySelector('app'));
// });
