var gulp = require('gulp');
var mocha = require('gulp-mocha');

gulp.task('test', function () {
  gulp.src('spec/*')
      .pipe(mocha({reporter: 'spec'}));
});
