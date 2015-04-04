'use strict';

import App from './app';
import React from 'react';
import Router from 'react-router';

Router.run(App.routes, function (Handler) {
  React.render(<Handler/>, document.querySelector('body'));
});

// Or, if you'd like to use the HTML5 history API for cleaner URLs:
// Router.run(routes, Router.HistoryLocation, function (Handler) {
//   React.render(<Handler/>, document.querySelector('app'));
// });
