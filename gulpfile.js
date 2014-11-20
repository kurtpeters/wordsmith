var gulp = require('gulp'),
    concat = require('gulp-concat'),
    uglify = require('gulp-uglify'),
    mocha = require('gulp-mocha');

gulp.task('default', function() {
    return gulp.src(['src/wordsmith.js', 'src/filters/*.js'])
    .pipe(concat('wordsmith.js'))
    .pipe(gulp.dest('./build/'))
    .pipe(uglify())
    .pipe(concat('wordsmith.min.js'))
    .pipe(gulp.dest('./build/'));
});

gulp.task('test', ['default'], function() {
    return gulp.src('tests/wordsmith.spec.js', {"read": false})
    .pipe(mocha({"reporter": 'nyan'}));
});

gulp.task('watch', function() {
  gulp.watch('src/**/*.js', ['default', 'test']);
});
