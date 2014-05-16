var gulp = require('gulp'),
    mocha = require('gulp-mocha'),
    jshint = require('gulp-jshint');
    jshintStylish = require('jshint-stylish'),
    es6ModuleTranspiler = require("gulp-es6-module-transpiler");

gulp.task('build', function () {
  return gulp.src("./comms.js")
      .pipe(es6ModuleTranspiler({
        type: (gulp.env.type || 'cjs')
      }))
      .pipe(gulp.dest("./build"));
});

gulp.task('test', ['build'], function () {
  return gulp.src('spec/*')
      .pipe(mocha({ reporter: 'spec' }));
});

gulp.task('lint', function() {
  return gulp.src('./comms.js')
      .pipe(jshint())
      .pipe(jshint.reporter(jshintStylish));
});

gulp.task('default', ['build']);
