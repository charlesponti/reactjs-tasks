'use strict';

import React from 'react';
import Router from 'react-router';

// Initialize TouchEvents
React.initializeTouchEvents(true);

import App from './app';

Router.run(App.routes, function (Handler) {
  React.render(<Handler/>, document.querySelector('#app'));
});

// Or, if you'd like to use the HTML5 history API for cleaner URLs:
// Router.run(routes, Router.HistoryLocation, function (Handler) {
//   React.render(<Handler/>, document.querySelector('app'));
// });
