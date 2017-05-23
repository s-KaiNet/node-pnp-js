var ts = require('gulp-typescript'),
    gulp = require('gulp'),
    merge = require('merge-stream'),
    sourcemaps = require('gulp-sourcemaps'),
    mocha = require('gulp-mocha'),
    plumber = require('gulp-plumber'),
    rns = require('run-sequence'),
    del = require('del');

gulp.task('tsc', function () {
    var tsResult = gulp.src(['src/**/*.ts'])
        .pipe(sourcemaps.init())
        .pipe(ts.createProject('tsconfig.json')());
    var tsTestResults = gulp.src(['test/**/*.ts'])
        .pipe(sourcemaps.init())
        .pipe(ts.createProject('tsconfig.json')());

    return merge(
        tsResult.js
            .pipe(sourcemaps.write('.'))
            .pipe(gulp.dest('./lib/src')),
        tsTestResults.js
            .pipe(sourcemaps.write('.'))
            .pipe(gulp.dest('./lib/test')),
        tsResult.dts
            .pipe(gulp.dest('./lib/src')));
});

gulp.task('test-int', function (callback) {
    rns('tsc', 'test-integration', callback);
});

gulp.task('test-integration', function () {
    return gulp.src('./lib/test/integration/tests.js', { read: false })
        .pipe(plumber())
        .pipe(mocha({ reporter: 'spec' }));
});

gulp.task('clean', function () {
    return del(['lib/**']);
});

gulp.task('prepublish', ['clean'], function () {
    var tsSourcesResult = gulp.src(['./src/**/*.ts'])
        .pipe(ts.createProject('tsconfig.json')());

    return merge(
        tsSourcesResult.js
            .pipe(gulp.dest('./lib/src')),
        tsSourcesResult.dts
            .pipe(gulp.dest('./lib/src')));
});