'use strict';

import React from 'react';
import {RouteHandler} from 'react-router';
import dropbox from '../dropbox-client';
import dispatcher from '../app/dispatcher';

export default React.createClass({

  componentDidMount() {
    if (dropbox.isAuthenticated()) {
      dropbox.getAccountInfo(function(err, account) {
        if (err)
          return console.warn('Error communicating with Dropbox:', err);

        dispatcher.dispatch({
          actionType: 'user:authenicated',
          data: account
        });
      });
    }
  },

  render() {
    return (
      <div>
        {/* this is the important part */}
        <RouteHandler/>
      </div>
    )
  }

});
