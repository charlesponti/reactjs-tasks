'use strict';

const dropbox = new Dropbox.Client({key: 'w2ncihown3ze0at' });

// Try to finish OAuth authorization.
dropbox.authenticate({interactive: false}, function (error) {
  if (error) {
    alert('Authentication error: ' + error);
  }
});

export default dropbox;
  /**
   * Retrieve table from datastore
   * @param {string} tableName
   * @returns {Promise}
   */
  getTable: function(tableName) {
    const datastoreManager = this.manager();
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
