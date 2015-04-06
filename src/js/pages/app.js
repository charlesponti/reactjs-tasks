'use strict';

import React from 'react';
import {RouteHandler} from 'react-router';

class App extends React.Component {

  constructor() {
    super();
  }

  render() {
    return (
      <div>
        {/* this is the important part */}
        <RouteHandler/>
      </div>
    )
  }

}

export default App;
