'use strict';

const client = new Dropbox.Client({key: 'w2ncihown3ze0at' });

// Try to finish OAuth authorization.
client.authenticate({interactive: false}, function (error) {
  if (error) {
    alert('Authentication error: ' + error);
  }
});

export default client
