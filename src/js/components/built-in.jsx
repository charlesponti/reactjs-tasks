'use strict';

import React from 'react';

class BuiltIn extends React.Component {

  render() {
    return (
      <div id="built-in">
        <h3> Built-in </h3>
        <section className="card">
          <ul>
            <li>
              <b>React (v0.13.1) & React-Router (v0.13.2)</b>
            </li>
            <li>
              <b>Browserify & Babel</b>
            </li>
            <li>
              <b>Karma</b> & <b>Jasmine</b>
            </li>
            <li>
              <b>SASS</b> w/ <b>Autoprefixer</b> & <b>CSSO</b>
            </li>
            <li>
              <b>Browser-Sync</b>
            </li>
            <li>
              <b>Gulp</b>
            </li>
          </ul>
        </section>
      </div>
    );
  }

}

export default BuiltIn;
