'use strict'

// Components
import App from '../components/app.jsx';
import Home from '../components/home.jsx';
import About from '../components/about.jsx';
import GettingStarted from '../components/getting-started.jsx';
import BuiltIn from '../components/built-in.jsx';
import NotFound from '../components/not-found';

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
    <Route path="/about" name="about" handler={About} />
    <Route path="/get-started" name="get-started" handler={GettingStarted} />
    <Route path="/built-in" name="built-in" handler={BuiltIn} />
  </Route>
);

Router.run(routes, function (Handler) {
  React.render(<Handler/>, document.querySelector('body'));
});

// Or, if you'd like to use the HTML5 history API for cleaner URLs:
// Router.run(routes, Router.HistoryLocation, function (Handler) {
//   React.render(<Handler/>, document.querySelector('app'));
// });
