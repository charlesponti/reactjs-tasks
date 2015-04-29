'use strict';

import React from 'react';
import {RouteHandler} from 'react-router';
import dispatcher from '../app/dispatcher';

export default React.createClass({

  render() {
    return (
      <div>
        {/* this is the important part */}
        <RouteHandler/>
      </div>
    )
  }

});
