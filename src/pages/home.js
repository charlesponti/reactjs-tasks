'use strict';

import React from 'react';

class Home extends React.Component {

  constructor() {
    super();
  }

  render() {
    return (
      <div>
        <h2 className="text-center"> React Life </h2>
        <button> <a href="#/tasks">Tasks</a> </button>
      </div>
    )
  }

}

export default Home;
