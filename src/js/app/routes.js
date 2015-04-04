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
