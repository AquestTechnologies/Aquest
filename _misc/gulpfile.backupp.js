var gulp          = require('gulp');
var gutil         = require('gulp-util');
var exit          = require('gulp-exit');
var less          = require('gulp-less');
var htmlmin       = require('gulp-htmlmin');
var nodemon       = require('gulp-nodemon');
var browserify    = require('browserify');
var babel         = require('babelify');
var source        = require('vinyl-source-stream'); // Use conventional text streams at the start of your gulp or vinyl pipelines, making for nicer interoperability with the existing npm stream ecosystem.
var del           = require('del');  // Deletes files.
var path          = require('path');
var flo           = require('fb-flo');
var fs            = require('fs');

// Quelques variables pour modifier la structure des fichiers facilement
var paths = {
  dist:       'dist/',
  server:     'src/server/index.js',
  index_html: ['src/shared/index.html'],
  app_jsx:    ['src/shared/app.jsx'],
  es6_files:  ['src/**/*.js*'],
  app_less:   ['src/client/less/app.less'],
  less_files: ['src/client/less/*.less']
};
 
gulp.task('default', ['serve']); 

// reset le build en le supprimant
gulp.task('clean', function(done) {

  del(['build'], done);
  
});


// Compile le less
gulp.task('compileless', ['clean'], function() {
  
  gulp.src(paths.app_less)
    .pipe(less())
    .pipe(gulp.dest(paths.dist));

});


// ES6 jsx -> ES5 js puis browserify app.js
gulp.task('bundlejs', ['clean'], function() {
  
  browserify(paths.app_jsx)
    .transform(babel.configure({
      stage: 1, //ES7 async wait
      optional: ['runtime'] //Regenerator en runtime et d'autre petites choses https://babeljs.io/docs/usage/runtime/
    }))
    .bundle()
    .pipe(source('app.js'))
    .pipe(gulp.dest(paths.dist));
  
});


gulp.task('minifyhtml', ['clean'], function() {
  
  return gulp.src(paths.index_html)
    .pipe(htmlmin({collapseWhitespace: true}))
    .pipe(gulp.dest(paths.dist));
    
});


gulp.task('build', ['compileless','bundlejs','minifyhtml'], function() {
  
  gutil.log(gutil.colors.bgBlue('Build complete!'));
  
});


gulp.task('serve', ['build'], function() {
  gulp.start('fb-flo');
  nodemon({
    script:   paths.server,
    env:      { 'NODE_ENV': 'development' },
    // env: { 'NODE_ENV': 'production' },
    execMap:  {
      'js': 'node_modules/babel/bin/babel-node --stage 1' //ES7 cote server
    },
    delay:    '0ms',
    watch:    ['src/shared/', 'src/server/'],
    ignore:   ['src/shared/components'],
    tasks: function (changedFiles) {
      var tasks = [];
      changedFiles.forEach(function (file) {
        if (path.extname(file) === '.jsx' && !~tasks.indexOf('bundlejs')) tasks.push('bundlejs');
        if (path.extname(file) === '.less' && !~tasks.indexOf('compileless')) tasks.push('compileless');
      });
      return tasks;
    }
  })/*.on('start', function(){
    console.clear();
  })*/;
  
});


//Degeu !!!
gulp.task('fb-flo', function (done) {
  var server = flo(
    './dist', {
      port: 8888,
      host: 'localhost',
      verbose: false,
      glob: [
        '**/*.{js,css,html}',
        '!**/*.{tmp,log,jpg,png,gif}'
      ]
    },
    resolver
  )
  .once('ready', done);
});

//DEGEU!!!!
function resolver(filepath, callback) {
  gutil.log('Reloading "', filepath, '" with flo...');

  // var file = './dist/' + filepath;

  callback({
    resourceURL: filepath,
    contents: fs.readFileSync('./dist/' + filepath),
    update: function (_window, _resourceURL) {
      console.log('Resource ' + _resourceURL + ' has just been updated with new content');
    },
    // reload: filepath.match(/\.(js|html)$/)
    reload: filepath.match(/\.(html)$/)
  });
}