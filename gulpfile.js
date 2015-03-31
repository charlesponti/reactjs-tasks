'use strict';

// Dependencies
var babelify = require('babelify');
var browserify = require('browserify');
var browserSync = require('browser-sync');
var buffer = require('vinyl-buffer');
var del = require('del');
var gulp = require('gulp');
var psi = require('psi');
var reload = browserSync.reload;
var runSequence = require('run-sequence');
var source = require('vinyl-source-stream');
var $ = require('gulp-load-plugins')();

/**
 * If gulp tasks should be run in 'production' mode
 * @return {Boolean}
 */
var isProd = require('yargs').argv.prod;

var config = {
  "js": {
    "entry": "./src/js/main.js",
    "source": ["src/js/**/*.js","src/js/**/*.jsx"],
    "dest": "dist/js"
  },
  "css": {
    "main": "./src/scss/main.scss",
    "source": "src/scss/**/*.scss",
    "build": "dist/css"
  },
  "html": {
    "source": "src/**/*.html",
    "build": "dist/"
  },
  "htmlReplace": {
    "css": "css/main.min.css",
    "js": "js/main.min.js"
  },
  "deploySite": "http://theponti.github.io/facade"
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
    'classnames'
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
  return gulp.src(config.css.main)
    .pipe($.sass({
      sourceComments: isProd ? 'none' : 'map',
      sourceMap: 'sass',
      outputStyle: isProd ? 'compressed' : 'nested',
      precision: 10,
      onError: console.error.bind(console, 'Sass error:')
    }))
    .pipe($.autoprefixer())
    .pipe($.if(isProd, $.csso()))
    .pipe($.if(isProd, $.rename('main.min.css')))
    .pipe(gulp.dest(config.css.build));
});

// Process HTML
gulp.task('html', function() {
  return gulp.src('src/**/*.html').pipe(gulp.dest('dist'));
});

// Optimize Images
gulp.task('images', function() {
  return gulp.src(['src/images/**/*'])
    .pipe(gulp.dest('dist/images'));
});

// Clean Output Directory
gulp.task('clean', function(done) {
  return del(['dist/**', '!dist/.git'], {dot: true}, done);
});

gulp.task('watch', function() {
  gulp.watch(config.html.source, ['html', reload]);
  gulp.watch(config.js.source, ['js', reload]);
  gulp.watch(config.css.source, ['css', reload]);
});

// Serve web site
gulp.task('serve', function() {
  browserSync({
    notify: false,
    logPrefix: 'Facade',
    server: 'dist'
  });
});

// Build development assets
gulp.task('build', function() {
  return runSequence(
    ['clean'],
    ['images'],
    ['js', 'css', 'html']
  );
});

// Build development assets and serve
gulp.task('default', function() {
  return runSequence(['build'], 'serve', 'watch');
});
