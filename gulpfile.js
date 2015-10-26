/* NPM modules */
var _            = require('lodash'),
    fs           = require('fs'),
    del          = require('del'),
    args         = require('yargs').argv,
    browserify   = require('browserify'),
    babelify     = require('babelify'),
    uglifyify    = require('uglifyify'),
    browserSync  = require('browser-sync'),
    bowerResolve = require('bower-resolve'),
    nodeResolve  = require('resolve'),
    source       = require('vinyl-source-stream'),
    buffer       = require('vinyl-buffer'),
    gulp         = require('gulp'),
    foreach      = require('gulp-foreach'),
    gulpif       = require('gulp-if'),
    size         = require('gulp-filesize'),
    gulpSequence = require('gulp-sequence'),
    plumber      = require('gulp-plumber')
    notify       = require('gulp-notify'),
    streamify    = require('gulp-streamify'),
    uglify       = require('gulp-uglify'),
    concat       = require('gulp-concat'),
    rename       = require('gulp-rename'),
    rev          = require('gulp-rev'),
    sass         = require('gulp-sass'),
    cmq          = require('gulp-combine-media-queries'),
    minifyCSS    = require('gulp-minify-css'),
    htmlmin      = require('gulp-htmlmin'),
    htmlreplace  = require('gulp-html-replace'),
    reload       = browserSync.reload;

/* Paths & project vars */
var APP    = 'app/',
    DIST   = 'dist/',
    ENV    = args.env,
    isProd = ENV === 'production';

/* Compile ES6 / JSX scripts & bundle with Browserify for custom files */
gulp.task('scripts-custom', function () {

  var b = browserify({ entries: './' + APP + 'scripts/main.js', debug: !isProd });

  // mark vendor libraries defined in bower.json as an external library,
  // so that it does not get bundled with app.js.
  // instead, we will load vendor libraries from vendors.js bundle
  getBowerPackageIds().forEach(function (lib) { b.external(lib); });

  // do the similar thing, but for npm-managed modules.
  // resolve path using 'resolve' module
  getNPMPackageIds().forEach(function (id) { b.external(id); });

  var stream = b
    .transform(babelify)
    .bundle()
    .on('error', onError)
    .pipe(source('app.js'));

  stream
    .pipe(gulpif(isProd, buffer()))
    .pipe(gulpif(isProd, uglify({ mangle: false })))
    .pipe(gulp.dest(APP + 'scripts/'));

  return stream;
});

/* Vendors scripts */
gulp.task('scripts-vendors', function () {
  var b = browserify({ debug: !isProd });

  getBowerPackageIds().forEach(function (id) {
    var resolvedPath = bowerResolve.fastReadSync(id);

    b.require(resolvedPath, {
      // exposes the package id, so that we can require() from our code.
      // for eg:
      // require('./vendor/angular/angular.js', {expose: 'angular'}) enables require('angular');
      // for more information: https://github.com/substack/node-browserify#brequirefile-opts
      expose: id
    });
  });

  // do the similar thing, but for npm-managed modules.
  // resolve path using 'resolve' module
  getNPMPackageIds().forEach(function (id) {
    b.require(nodeResolve.sync(id), { expose: id });
  });

  var stream = b
    .bundle()
    .on('error', onError)
    .pipe(source('vendors.js'));

  stream
    .pipe(gulpif(isProd, buffer()))
    .pipe(gulpif(isProd, uglify({ mangle: false })))
    .pipe(gulp.dest(APP + 'scripts/'));

  return stream;
});

/* Build vendors */
gulp.task('build-scripts-vendors', function () {
  return gulp.src(APP + 'scripts/vendors.js')
    .pipe(rename({ suffix: '.min' }))
    .pipe(rev())
    .pipe(gulp.dest(DIST + 'scripts/'))
    .pipe(rev.manifest(DIST + 'rev-manifest.json', { base: process.cwd() + '/dist', merge: true }))
    .pipe(gulp.dest(DIST));
});

/* Build scripts */
gulp.task('build-scripts-custom', function () {
  return gulp.src(APP + 'scripts/app.js')
    .pipe(rename({ suffix: '.min' }))
    .pipe(rev())
    .pipe(gulp.dest(DIST + 'scripts/'))
    .pipe(rev.manifest(DIST + 'rev-manifest.json', { base: process.cwd() + '/dist', merge: true }))
    .pipe(gulp.dest(DIST));
});

/* Compile sass into CSS & auto-inject into browsers */
gulp.task('styles', function () {
  return gulp.src(APP + 'styles/main.scss')
    .pipe(plumber({ errorHandler: onError }))
    .pipe(sass())
    .pipe(rename('app.css'))
    .pipe(gulp.dest(APP + 'styles'))
    .pipe(browserSync.stream());
});

/* Dist styles minification */
gulp.task('build-styles', ['styles'], function () {
  return gulp.src(APP + 'styles/app.css')
    .pipe(cmq())
    .pipe(gulpif(isProd, minifyCSS({ keepSpecialComments: 0, advanced: false })))
    .pipe(rename('app.min.css'))
    .pipe(rev())
    .pipe(gulp.dest(DIST + '/styles'))
    .pipe(rev.manifest(DIST + 'rev-manifest.json', { base: process.cwd() + '/dist', merge: true }))
    .pipe(gulp.dest(DIST));
});

/* Dist html minification and file rev replacement */
gulp.task('build-html', function () {
  var manifest = require('./' + DIST + 'rev-manifest.json'),
      styles = manifest['app.min.css'],
      scriptsVendors = manifest['vendors.min.js'],
      scriptsCustom = manifest['app.min.js'];

  return gulp.src(APP + '/index.html')
    .pipe(htmlreplace({
        styles: 'styles/' + styles,
        jsVendors: 'scripts/' + scriptsVendors,
        jsCustom: 'scripts/' + scriptsCustom
      }))
    .pipe(htmlmin({ collapseWhitespace: true }))
    .pipe(gulp.dest(DIST));
});

/* Show build files' size */
gulp.task('stats', function () {
  return gulp.src([DIST + '/**/*.{js,css,gz}'])
    .pipe(foreach(function (stream, file) {
      return gulp.src(file.path)
        .pipe(size());
    }));
});

/* Serve the app in dev mode */
gulp.task('serve', ['scripts-vendors', 'scripts-custom', 'styles'], function () {
  /* Start local static server */
  browserSync({
    notify: false,
    files: [APP + 'scripts/app.js', APP + 'styles/main.css'],
    server: {
      baseDir: "./app"
    }
  });

  /* Watch scripts */
  gulp.watch([
    APP + 'scripts/**/*.js',
    '!' + APP + 'scripts/app.js',
    '!' + APP + 'scripts/vendors.js'
  ], ['scripts-custom', reload]);

  /* SCSS */
  gulp.watch(APP + "styles/**/*.scss", ['styles']);

  /* html reload */
  gulp.watch(APP + '*.html').on('change', reload);
});

/* Deletes the build folder entirely. */
gulp.task('clean', del.bind(null, [DIST]));

/* Build task */
gulp.task('build', gulpSequence(
  'clean',
  'scripts-vendors',
  'scripts-custom',
  'build-scripts-vendors',
  'build-scripts-custom',
  'build-styles',
  'build-html',
  'stats'
));

/* Utils */

/* Errors handler */
function onError (err) {
  notify.onError({
    title:    "Gulp",
    subtitle: "Failure!",
    message:  "Error: <%= error.message %>"
  })(err);

  this.emit('end');
};

// Read bower.json and get dependencies' package ids
function getBowerPackageIds() {
  var bowerManifest = {};
  try {
    bowerManifest = require('./bower.json');
  } catch (e) {
    // does not have a bower.json manifest
  }
  return _.keys(bowerManifest.dependencies) || [];
}

// Read package.json and get dependencies' package ids
function getNPMPackageIds() {
  var packageManifest = {};
  try {
    packageManifest = require('./package.json');
  } catch (e) {
    // does not have a package.json manifest
  }
  return _.keys(packageManifest.dependencies) || [];
}
