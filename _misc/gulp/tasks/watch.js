var gulp = require('gulp');

var basePaths = {
  js: ['app/**/*.js'],
  jsx: ['app/**/*.jsx'],
  less: ['app/**/*.less'],
};
 
// Rerun tasks whenever a file changes. 
gulp.task('watch', function() {
  gulp.watch(basePaths.jsx, basePaths.js, ['browserify']);
  gulp.watch(basePaths.less, ['less']);
});   