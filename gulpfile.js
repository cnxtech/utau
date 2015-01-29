/* jshint node:true */
'use strict';
var gulp = require('gulp');
var $ = require('gulp-load-plugins')();
var browserSync = require('browser-sync');
var reload = browserSync.reload;
var asset = function (file) {
  return 'src/assets/' + file;
}

gulp.task('sass', function () {
  return gulp.src(asset('styles/main.scss'))
    .pipe($.plumber())
    .pipe($.rubySass({
      style: 'expanded',
      precision: 10
    }))
    .pipe($.autoprefixer({browsers: ['last 1 version']}))
    .pipe(gulp.dest(asset('styles')))
    .pipe(gulp.dest('dist/assets/styles'));
});

gulp.task('js', ['jshint'], function() {
  return gulp.src(asset('scripts/**/*.js'))
    .pipe($.changed('dist/assets/scripts'))
    .pipe($.uglify())
    .pipe(gulp.dest('dist/assets/scripts'));
});

gulp.task('jshint', function () {
  return gulp.src(asset('scripts/**/*.js'))
    .pipe($.changed('dist/assets/scripts'))
    .pipe($.jshint())
    .pipe($.jshint.reporter('jshint-stylish'))
    .pipe($.jshint.reporter('fail'));
});

gulp.task('layout', ['bower'], function () {
  gulp.start('useref');
});

gulp.task('bower', function () {
  var wiredep = require('wiredep').stream;

  gulp.src('src/default.hbs')
    .pipe(wiredep())
    .pipe(gulp.dest('src'));
});

gulp.task('useref', function () {
  var assets = $.useref.assets();

  return gulp.src('src/default.hbs')
    .pipe(assets)
    .pipe($.if('*.js', $.uglify()))
    .pipe($.if('*.css', $.csso()))
    .pipe(assets.restore())
    .pipe($.useref())
    .pipe(gulp.dest('dist'));
});

gulp.task('hbs', function () {
  return gulp.src(['src/**/*.hbs', '!src/default.hbs'])
    .pipe($.changed('dist'))
    .pipe(gulp.dest('dist'));
});

gulp.task('images', function () {
  return gulp.src(require('main-bower-files')().concat(asset('images/**/*')))
    .pipe($.filter('**/*.{png,jpg,jpeg,gif}'))
    .pipe($.changed('dist/assets/images'))
    .pipe($.imagemin({
      progressive: true,
      interlaced: true
    }))
    .pipe(gulp.dest('dist/assets/images'));
});

gulp.task('fonts', function () {
  return gulp.src(require('main-bower-files')().concat(asset('fonts/**/*')))
    .pipe($.filter('**/*.{eot,svg,ttf,woff}'))
    .pipe($.flatten())
    .pipe(gulp.dest('dist/assets/fonts'));
});

gulp.task('extras', function () {
  return gulp.src([
    'src/*.*',
    '!src/*.hbs'
  ], {
    dot: true
  }).pipe(gulp.dest('dist'));
});

gulp.task('ghost', function () {
  return gulp.src('package.json')
    .pipe(gulp.dest('dist'));
});

gulp.task('clean', require('del').bind(null, ['dist']));

gulp.task('watch', function () {
  browserSync({
    open: false,
    notify: false,
    proxy: 'localhost:2368'
  });

  $.watch(['dist/**/*.hbs', 'dist/assets/**/*'], reload);

  gulp.watch(['src/default.hbs', 'bower_components/semantic-ui/dist/semantic.css'], ['layout']);
  gulp.watch(['src/**/*.hbs', '!src/default.hbs'], ['hbs']);
  gulp.watch(asset('scripts/*.js'), ['useref']);
  gulp.watch(asset('styles/**/*.scss'), ['sass']);
  gulp.watch('bower.json', ['bower', 'fonts']);
});

gulp.task('build', ['layout', 'hbs', 'sass', 'js', 'images', 'fonts', 'extras', 'ghost'], function () {
  gulp.start('watch');
  return gulp.src('dist/**/*').pipe($.size({title: 'build', gzip: true}));
});

gulp.task('default', ['clean'], function () {
  gulp.start('build');
});
