'use strict';

import React from 'react';

class TextField extends React.Component {

  constructor() {
    this.state = {
      read: true,
      value: 'foo bar'
    }
  }

  onClick() {
    this.setState({ read: !this.state.read });
  }

  render() {
    var input = <input type="text" value={this.state.value}/>;
    var span = <span>{this.state.value}</span>;
    return (
      <div onClick={this.onClick.bind(this)}>
        {this.state.read ? span : input}
      </div>
    );
  }
}

export default TextField;


