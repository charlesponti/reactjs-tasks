'use strict';

import React from 'react';

class Home extends React.Component {

  constructor() {
    super();
  }

  render() {
    return (
      <section className="text-center home">
        <button> <a href="#/tasks">Tasks</a> </button>
      </section>
    )
  }

}

export default Home;
