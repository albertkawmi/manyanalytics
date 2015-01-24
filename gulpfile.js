// Simple Angular App - Gulpfile
// Created 2014-12-11 by Albert Kawmi

// Require modules
var gulp   = require('gulp');
var rename = require('gulp-rename');
var sass = require('gulp-sass');
var prefix = require('gulp-autoprefixer');
var connect = require('gulp-connect');

// Compile Our Sass
gulp.task('sass', function() {
    return gulp.src('*.scss')
      .pipe(sass())
  		.pipe(prefix('last 3 versions', '> 1%'))
  		.pipe(rename('style.prefix.css'))
    	.pipe(rename('style.css'))
    	.pipe(gulp.dest(''))
      .pipe(connect.reload());
});

// LiveReload HTML
gulp.task('html', function() {
  gulp.src('*.html')
    .pipe(connect.reload());
});

// LiveReload JS
gulp.task('js', function() {
  gulp.src('*.js')
    .pipe(connect.reload());
});

// gulp-connect dev server
gulp.task('webserver', function() {
  connect.server({
    root: '',
    port: 80,
    //host: '127.0.0.2', // not working ??? Using default 'localhost' instead
    livereload: true
  });
});

// Watch Files For Changes
gulp.task('watch', function() {
    gulp.watch('*.scss', ['sass']);
    gulp.watch('*.html', ['html']);
    gulp.watch('*.js', ['js']);
});

// Test Task
gulp.task('test', function(){
    console.log("Gulpfile for simple Angular App - by Albert Kawmi");
});

gulp.task('serve', ['webserver', 'watch']);
