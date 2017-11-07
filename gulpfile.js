const gulp = require('gulp');
const concat = require('gulp-concat');
const uglify = require('gulp-uglify');
const imagemin = require('gulp-imagemin');
const cssmin = require('gulp-cssmin');
const htmlmin = require('gulp-htmlmin');
const sass = require('gulp-sass');
const connect = require('gulp-connect');
const count = require('gulp-count');
const nodemon = require('gulp-nodemon');
const templateCache = require('gulp-angular-templatecache');


// JS Vendor Files - Order Matters
const jsVendorFiles = [
    './node_modules/jquery/dist/jquery.min.js',
    './node_modules/angular/angular.min.js',
    './node_modules/bootstrap/dist/js/bootstrap.min.js',
    './node_modules/angular-animate/angular-animate.min.js',
    './node_modules/angular-aria/angular-aria.min.js',
    './node_modules/chart.js/dist/Chart.min.js',
    './node_modules/angular-chart.js/dist/angular-chart.js',
    './node_modules/angular-messages/angular-messages.min.js',
    './node_modules/angular-material/angular-material.min.js',
    './node_modules/angular-route/angular-route.js',
    './node_modules/angular-cookies/angular-cookies.min.js',
    './node_modules/material-design-lite/material.js',
    './node_modules/filepicker-js/dist/filepicker.min.js',
    './node_modules/angular-filepicker/dist/angular_filepicker.min.js',
    './node_modules/angular-loading-bar/build/loading-bar.min.js',
    './node_modules/file-saver/FileSaver.min.js',
    './node_modules/angular-simple-logger/dist/angular-simple-logger.min.js',
    './node_modules/lodash/lodash.min.js',
    './node_modules/angular-google-maps/dist/angular-google-maps.min.js',
    './node_modules/vsGoogleAutocomplete/dist/vs-google-autocomplete.min.js',
    './node_modules/satellizer/dist/satellizer.min.js',
    './node_modules/material-modal/dist/js/material-modal.min.js',
  ];

// CSS Vendor Files
const cssVendorFiles = [
    './node_modules/material-design-lite/material.min.css',
    './node_modules/angular-material/angular-material.min.css',
    './node_modules/bootstrap/dist/css/bootstrap.min.css',
    './node_modules/angular-loading-bar/build/loading-bar.min.css',
    './node_modules/material-modal/dist/css/material-modal.min.css',
];


// Compile JS Vendor Files
gulp.task('js-vendor', function() {
    gulp.src(jsVendorFiles)
    .pipe(count('## js-vendors selected'))
    .pipe(concat('vendor.js'))
    .pipe(uglify({mangle: false}))
    .pipe(gulp.dest('dist/js'))
});

// Compile CSS Vendor Files
gulp.task('css-vendor', function() {
    gulp.src(cssVendorFiles)
    .pipe(count('## css-vendors selected'))
    .pipe(concat('vendor.css'))
    .pipe(cssmin())
    .pipe(gulp.dest('dist/css'))
});

// Optimise Images
gulp.task('img-app', () =>
gulp.src('./app/assets/img/*')
    .pipe(count('## images selected'))
    .pipe(imagemin())
    .pipe(gulp.dest('dist/img'))
    .pipe(connect.reload())
);

// Compile JS Files
gulp.task('js-app', function() {
    gulp.src([
      './app/app.js',
      './app/controllers/**/*.js',
      './app/services/*.js',
    ])
    .pipe(count('## js-app files selected'))
    .pipe(concat('app.js'))
    .pipe(gulp.dest('dist/js'))
    .pipe(connect.reload());
});

// Compile JS Files for Production
gulp.task('js-app-prod', function() {
    gulp.src([
      './app/app.js',
      './app/controllers/**/*.js',
      './app/services/*.js',
    ])
    .pipe(count('## js-app files selected'))
    .pipe(concat('app.js'))
    //.pipe(uglify({mangle: false}))
    .pipe(gulp.dest('dist/js'))
    .pipe(connect.reload());
});

gulp.task('js-custom', function() {
    gulp.src([
        './app/assets/js/*.js',
    ])
    .pipe(count('## js-custom files selected'))
    .pipe(concat('custom.js'))
    .pipe(uglify({mangle: false}))
    .pipe(gulp.dest('dist/js'))
    .pipe(connect.reload());
});
// Compile SCSS Files
gulp.task('css-app', function() {
    gulp.src('./app/assets/scss/*.scss')
    .pipe(sass().on('error', sass.logError))
    .pipe(count('## css-app files selected'))
    .pipe(cssmin())
    .pipe(concat('app.css'))
    .pipe(gulp.dest('dist/css'))
    .pipe(connect.reload());
});
// Compile HTML Files
gulp.task('html-app', function() {
    gulp.src('app/index.html')
    .pipe(concat('app.html'))
    .pipe(htmlmin({collapseWhitespace: true}))
    .pipe(gulp.dest('dist'))
    .pipe(connect.reload());
});

// Compile HTML Template Files
gulp.task('html-templates', function () {
    gulp.src('./app/partials/**/*.html')
    .pipe(templateCache({ module:'MyApp'}))
    .pipe(gulp.dest('dist/js'))
    .pipe(connect.reload());
});


// gulp task watcher (automatically compile files)
gulp.task('watch', function(){
    connect.server({
        livereload: true
    });
    gulp.watch('./app/assets/img/*', ['img-app']);
    gulp.watch('./app/**/*.js', ['js-app', 'js-custom']);
    gulp.watch('./app/assets/scss/*.scss', ['css-app']);
    gulp.watch('./app/index.html', ['html-app']);
    gulp.watch('./app/partials/**/*.html', ['html-templates']);
})

// start our server and listen for changes
gulp.task('server', function() {
    // configure nodemon
    nodemon({
        // the script to run the app
        script: 'server.js',
        // this listens to changes in any of these files/routes and restarts the application
        watch: ["server.js", "server/*"],
        ext: 'js'
        // Below i'm using es6 arrow functions but you can remove the arrow and have it a normal .on('restart', function() { // then place your stuff in here }
    }).on('restart', () => {
        gulp.src('server.js')
        .pipe(connect.reload());
    });
});

// Initialise Common Tasks
gulp.task('init', [ 'js-vendor', 'css-vendor', 'img-app', 'html-app','css-app', 'js-custom', 'html-templates']);
gulp.task('dev', ['init', 'js-app','watch', 'server']);
gulp.task('prod', ['init', 'js-app-prod']);

// Default is dev mode
gulp.task('default', ['dev']);
