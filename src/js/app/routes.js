'use strict';

// Components
import App from '../pages/app';
import Home from '../pages/home';
import NotFound from '../pages/not-found';
import TaskPage from '../pages/tasks';

// Dependencies
import React from 'react';
import Router from 'react-router';

let Route  = Router.Route;
let DefaultRoute = Router.DefaultRoute;
let NotFoundRoute = Router.NotFoundRoute;

var routes = (
  <Route path="/" handler={App}>
    <DefaultRoute handler={Home} />
    <NotFoundRoute handler={NotFound}/>
    <Route path="tasks" handler={TaskPage} />
  </Route>
);

export default routes;

// Or, if you'd like to use the HTML5 history API for cleaner URLs:
// Router.run(routes, Router.HistoryLocation, function (Handler) {
//   React.render(<Handler/>, document.querySelector('app'));
// });
