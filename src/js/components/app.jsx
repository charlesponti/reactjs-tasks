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
        <header className="site ui-blue">
            <div
              className={classnames("hamburger menu", open)}
              href="#"
              onClick={this.onClick.bind(this, 'icon')}>
              <i></i>
            </div>
            <div className="logo">React Boilerplate</div>
        </header>
        <nav className={classnames('site ui-blue', open)} onClick={this.onClick.bind(this, 'nav')}>
          <ul>
            <li>
              <a href="#"> Link </a>
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
