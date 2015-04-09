'use strict';

// Dependencies
var babelify = require('babelify');
var browserify = require('browserify');
var buffer = require('vinyl-buffer');
var gulp = require('gulp');
var psi = require('psi');
var runSequence = require('run-sequence');
var source = require('vinyl-source-stream');
var $ = require('gulp-load-plugins')();

/**
 * Return path to bower component
 * @param {string} path
 * @returns {string}
 */
function bower(path) {
  return './bower_components/'+path;
}

/**
 * If gulp tasks should be run in 'production' mode
 * @return {Boolean}
 */
var isProd = require('yargs').argv.prod;

var config = {
  "js": {
    "entry": "./src/main.js",
    "source": "src/**/*.js",
    "dest": "dist/js"
  },
  "css": {
    "main": "./src/main.less",
    "source": "src/**/*.less",
    "dest": "dist/css"
  },
  "deploySite": "http://theponti.github.io/react-tasks"
};

// Run Pagespeed Insights on mobile
gulp.task('pagespeed:mobile', function(done) {
  return psi.output(config.deploySite, {
    nokey: 'true',
    strategy: 'mobile'
  }, done);
});

// Run Pagespeed Insights on mobile
gulp.task('pagespeed:desktop', function(done) {
  return psi.output(config.deploySite, {
    nokey: 'true',
    strategy: 'desktop'
  }, done);
});

// Run Pagespeed Insights on both mobile and desktop
gulp.task('pagespeed', function() {
  return runSequence('pagespeed:mobile', 'pagespeed:desktop');
});

// Lint and build source JavaScript files
gulp.task('js', function() {
  var dependencies = [
    'react',
    'react-router',
    'flux',
    'classnames',
    'lodash'
  ];

  browserify({
      debug: !isProd,
      entries: [config.js.entry],
      transform: [babelify]
    })
    .external(isProd ? [] : dependencies)
    .bundle()
    .on('error', $.util.log)
    .pipe(source('main.js'))
    .pipe(buffer())
    .pipe($.if(isProd, $.uglify({ mangle: false })))
    .pipe(gulp.dest(config.js.dest));

  // Vendor bundle
  if (!isProd) {
    browserify({
      debug: true,
      require: dependencies
    })
    .bundle()
    .on('error', $.util.log)
    .pipe(source('vendor.js'))
    .pipe(buffer())
    .pipe($.if(isProd, $.uglify({ mangle: false })))
    .pipe(gulp.dest(config.js.dest));
  }

});

// Build CSS files
gulp.task('css', function() {
  var stream = gulp.src(config.css.main);

  stream
    .pipe($.if(!isProd, $.sourcemaps.init({ loadMaps: true })))
    .pipe($.less())
    .pipe($.autoprefixer())
    .pipe($.if(!isProd, $.sourcemaps.write()))
    .pipe($.size({ title: 'CSS' }))
    .pipe(gulp.dest(config.css.dest));

  return stream;
});

// Optimize Images
gulp.task('images', function() {
  return gulp.src(['src/images/**/*'])
    .pipe(gulp.dest('dist/images'));
});

// Copy vendor dependencies
gulp.task('vendor', function() {
  var stream = gulp.src([
    bower('facade-ui/dist/facade.css'),
    bower('facade-ui/dist/facade.js'),
    bower('fontawesome/css/font-awesome.min.css'),
  ]);

  stream
    .pipe(gulp.dest('dist/vendor'));

  gulp.src(bower('fontawesome/fonts/**/*'))
    .pipe(gulp.dest('dist/fonts'));

  return stream;
});

// Watch files
gulp.task('watch', function() {
  gulp.watch(config.js.source, ['js']);
  gulp.watch(config.css.source, ['css']);
});

// Build development assets
gulp.task('build', function() {
  return runSequence(['images'], ['js', 'css']);
});

// Build development assets and serve
gulp.task('default', function() {
  return runSequence(['build'], 'watch');
});
