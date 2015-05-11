'use strict';

// Components
import App from '../pages/app';
import Home from '../pages/home';
import NotFound from '../pages/not-found';
import TaskPage from '../tasks';
import ActivityPage from '../activity';
import SignUpPage from '../pages/sign-up.js';

// Dependencies
import React from 'react';
import Router from 'react-router';

let routes;
let Route  = Router.Route;
let DefaultRoute = Router.DefaultRoute;
let NotFoundRoute = Router.NotFoundRoute;

if (Parse.User.current()) {
  routes = (
    <Route path="/" handler={App}>
      <DefaultRoute handler={Home}/>
      <NotFoundRoute handler={NotFound}/>
      <Route path="tasks" handler={TaskPage}/>
      <Route path="activity" handler={ActivityPage}/>
    </Route>
  );
}
else {
  routes = (
    <Route path="/" handler={App}>
      <DefaultRoute handler={SignUpPage} />
      <NotFoundRoute handler={NotFound}/>
    </Route>
  );
}

export default routes;
