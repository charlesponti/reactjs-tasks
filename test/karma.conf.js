'use strict';

module.exports = function(karma) {
  karma.set({

    basePath: '../',

    browsers: [
      'Chrome'
    ],

    frameworks: [
      'browserify',
      'mocha',
      'chai',
      'sinon-chai'
    ],

    files: [
      'test/**/*.js'
    ],

    preprocessors: {
      'test/**/*.js': ['browserify']
    },

    browserify: {
      debug: true,
      extensions: ['.js'],
      transform: ['babelify']
    },

    plugins: [
      'karma-mocha',
      'karma-chai-plugins',
      'karma-browserify',
      'karma-chrome-launcher'
    ]

  });
};
