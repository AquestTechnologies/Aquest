var gulp = require('gulp');
var less = require('gulp-less');

var basePaths = {
  app_less: ['app/less/styles.less'],
  js: ['app/**/*.js'],
  jsx: ['app/**/*.jsx'],
  less: ['app/**/*.less'],
};
 
// Compile le less
gulp.task('less', ['clean'], function() {
  gulp.src(basePaths.app_less)
    .pipe(less())
    .pipe(gulp.dest('public/stylesheets/'));
});