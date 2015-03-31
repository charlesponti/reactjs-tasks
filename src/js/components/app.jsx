'use strict';

import classnames from 'classnames';
import React from 'react';
import {RouteHandler} from 'react-router';

class App extends React.Component {

  constructor() {
    this.state = {
      open: false
    };
  }

  /**
   * Handle click event
   * @param {string} source
   * @param {SyntheticEvent} event
   */
  onClick(source, event) {
    // Always close nav drawer if main was clicked
    if (source === 'main')
      this.setState({ open: false });
    // Otherwise toggle open
    else
      this.setState({ open: !this.state.open });
  }

  render() {
    let open = { open: this.state.open };
    return (
      <div>
        <header className="site-header ui-blue">
            <div
              className={classnames("hamburger menu", open)}
              href="#"
              onClick={this.onClick.bind(this, 'icon')}>
              <i></i>
            </div>
            <div className="logo">Facade-React</div>
        </header>
        <nav className={classnames('site-nav ui-blue', open)} onClick={this.onClick.bind(this, 'nav')}>
          <ul>
            <li>
              <a href="#/about"> About </a>
            </li>
            <li>
              <a href="#/get-started"> Get Started </a>
            </li>
            <li>
              <a href="#/built-in"> Built-in </a>
            </li>
            <li>
              <a href="https://github.com/theponti/facade-react"> Code </a>
            </li>
          </ul>
        </nav>
        <main className={classnames(open)} onClick={this.onClick.bind(this, 'main')}>
            {/* this is the important part */}
            <RouteHandler/>
        </main>
      </div>
    )
  }

}

export default App;
