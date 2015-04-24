'use strict';

import constants from './app/constants.js';

let client = new Firebase('https://ex5iofp0tf0.firebaseio-demo.com/');

client.on(constants.FIREBASE.ADDED, function(snapshot) {
  //We'll fill this in later.
});
export default client;
