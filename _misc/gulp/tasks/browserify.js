var gulp = require('gulp');
var browserify = require('browserify');
var babelify = require('babelify');
var source = require('vinyl-source-stream');

var basePaths = {
  app_jsx: ['app/app.jsx'],
  app_js: ['app/index.js'],
  js: ['app/**/*.js'],
  jsx: ['app/**/*.jsx'],
  less: ['app/**/*.less'],
};

// ES6 jsx -> ES5 js puis browserify app.js
gulp.task('browserify', ['clean'], function() {
  // Browserify/bundle the JS.
  browserify(basePaths.app_js)
    .transform(babelify)
    .bundle()
    .pipe(source('bundle.js'))
    .pipe(gulp.dest('public/js/'));
});
