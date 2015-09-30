var gulp = require('gulp');
var htmlmin = require('gulp-htmlmin');

gulp.task('minifyhtml', function() {
  return gulp.src('app/index.html')
    .pipe(htmlmin({collapseWhitespace: true}))
    .pipe(gulp.dest('public/html/'))
});