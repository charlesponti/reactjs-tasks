'use strict';

import React from 'react';

export default React.createClass({

  render() {
    return (
      <form>
        {this.props.fields.map(function(field, index) {
          return React.createElement(field, { key: index });
        })}
      </form>
    );
  }

});
