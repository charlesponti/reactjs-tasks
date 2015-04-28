'use strict';

window.Parse
  .initialize(
    "D1yUthHcRNvTyamye2wRzqAbzS2gB5oXO19eXe8L",
    "0oeaJSgscprh9SHGDZGifwQxqNrnn4CDgwOmDssM"
  );

import React from 'react';
import Router from 'react-router';
import App from './app';

// Initialize TouchEvents
React.initializeTouchEvents(true);

Router.run(App.routes, function (Handler) {
  React.render(<Handler/>, document.querySelector('#app'));
});
