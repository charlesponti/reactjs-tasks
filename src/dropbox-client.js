'use strict';

const dropbox = new Dropbox.Client({key: 'w2ncihown3ze0at' });

// Try to finish OAuth authorization.
dropbox.authenticate({interactive: false}, function (error) {
  if (error) {
    alert('Authentication error: ' + error);
  }
});

export default dropbox;
