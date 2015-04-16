'use strict';

const userConstants = require('./app/constants').USER;
const dispatcher = require('./app/dispatcher');
const client = new Dropbox.Client({key: 'w2ncihown3ze0at' });

// Try to finish OAuth authorization.
client.authenticate({interactive: false}, function (error) {
  if (error) {
    alert('Authentication error: ' + error);
  }
});

// Register Dropbox client with dispatcher
client.token = dispatcher.register(function(payload) {

  switch (payload.action) {
    case userConstants.AUTHENTICATED:
      client.manager = client.getDatastoreManager();
    case userConstants.UNAUTHENTICATED:
    default:
      console.info(payload.action, ':', payload.data);
  }

});

/**
 * Retrieve table from datastore
 * @param {string} tableName
 * @returns {Promise}
 */
client.getTable = function getDropboxTable(tableName) {
  if (client.isAuthenticated()) {
    const manager = client.getDatastoreManager();
    return new Promise((resolve, reject) => {
      datastoreManager.openDefaultDatastore(function(error, store) {
        if (error) {
          return reject(error);
        }

        // Return table from datastore
        return resolve(store.getTable(tableName));
      });
    });
  }
  else {
    // TODO Implement function that authenticates user and returns promise
  }
};

export default client;
