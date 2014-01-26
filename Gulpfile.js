var gulp = require('gulp'),
    mocha = require('gulp-mocha'),
    jshint = require('gulp-jshint');
    jshintStylish = require('jshint-stylish');

gulp.task('test', function () {
  gulp.src('spec/*')
      .pipe(mocha({reporter: 'spec'}));
});

gulp.task('lint', function() {
  gulp.src('./comms.js')
      .pipe(jshint())
      .pipe(jshint.reporter(jshintStylish));
});
