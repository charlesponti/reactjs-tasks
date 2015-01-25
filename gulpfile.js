'use strict';

var gulp = require('gulp');
var $ = {};
$.if = require('gulp-if');
$.autoprefixer = require('gulp-autoprefixer');
$.csso = require('gulp-csso');
$.rename = require('gulp-rename');
$.sass = require('gulp-sass');
$.size = require('gulp-size');
$.uglify = require('gulp-uglify');
var browserSync = require('browser-sync');
var reload = browserSync.reload;

// Lint and build source JavaScript files
gulp.task('js', function() {
  return gulp.src('src/js/main.js')
    .pipe($.if(global.isProd, $.uglify()))
    .pipe($.if(!global.isProd, $.rename('semantic-nav.js')))
    .pipe($.if(global.isProd, $.rename('semantic-nav.min.js')))
    .pipe(gulp.dest('dist'))
    .pipe($.size({title: 'JavaScript'}));
});

// Build CSS files
gulp.task('css', function() {
  return gulp.src('src/scss/main.scss')
    .pipe($.sass({
      sourceComments: global.isProd ? 'none' : 'map',
      sourceMap: 'sass',
      outputStyle: global.isProd ? 'compressed' : 'nested',
      precision: 10,
      onError: console.error.bind(console, 'Sass error:')
    }))
    .pipe($.autoprefixer())
    .pipe($.if(global.isProd, $.csso()))
    .pipe($.if(!global.isProd, $.rename('semantic-nav.css')))
    .pipe($.if(global.isProd, $.rename('semantic-nav.min.css')))
    .pipe(gulp.dest('dist'))
    .pipe($.size({title: 'CSS'}));
});

// Serve web site
gulp.task('serve', function(next) {
  browserSync({
    notify: false,
    logPrefix: 'SemanticNav',
    // Run as an https by uncommenting 'https: true'
    // Note: this uses an unsigned certificate which on first access
    //       will present a certificate warning in the browser.
    // https: true,
    server: '.'
  });


  gulp.watch('src/js/**', ['js', reload]);
  gulp.watch('src/scss/**', ['css', reload]);
  return next();
});

gulp.task('default', ['css', 'js', 'serve']);
