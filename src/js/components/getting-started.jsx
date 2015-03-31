'use strict';

import React from 'react';

class GettingStarted extends React.Component {

  render() {
    return (
      <div id="get-started">
          <h3> Getting Started </h3>
          <section className="card">
              <ol>
                  <li>
                      Clone <a href="https://github.com/theponti/facade-react">repo</a>
                  </li>
                  <li>
                      <code> npm install </code>
                  </li>
                  <li>
                      <code> npm start </code>
                  </li>
                  <li>
                      Start coding
                  </li>
              </ol>
          </section>
      </div>
    );
  }

}

export default GettingStarted;
