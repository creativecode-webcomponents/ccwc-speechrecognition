var gulp = require('gulp');
var sourcemaps = require('gulp-sourcemaps');
var babel = require('gulp-babel');
var concat = require('gulp-concat');

gulp.task('default', function () {
    return gulp.src('src/**/*.es6')
        .pipe(sourcemaps.init())
        .pipe(babel())
        .pipe(concat('ccwc-speechrecognition.js'))
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest('./src'));
});