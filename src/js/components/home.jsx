'use strict';

import React from 'react';
import TextField from '../fields/text-field';

class Home extends React.Component {

  render() {
    return (
      <div>
        <h2 className="text-center"> React Boilerplate </h2>
        <div className="container" id="app">
            <TextField/>
        </div>
      </div>
    )
  }

}

export default Home;
