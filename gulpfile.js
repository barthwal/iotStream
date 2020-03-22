const { series, parallel, src, dest, watch } = require("gulp");
var fs = require('fs');
var Candyman = require("candyman");
var uglify = require("gulp-uglify");
var babel = require("gulp-babel");
var concat = require("gulp-concat");
var del = require("del");

// Setup path for gulp
var paths = {
  scripts: {
    src: "app/**/*.js",
    dest: "build/"
  }
};

// Config to connect with iot device
var config = JSON.parse(fs.readFileSync('./config.json'));

// Candayman config setup 
var candymanConfig = config.candymanConfig;
candymanConfig.targetDevices[0].startFile = paths.scripts.dest + config.buildMainFile;


function clean() {
  return del(["build"]);
}

function scripts() {
  return src(paths.scripts.src, { sourcemaps: true })
    .pipe(babel())
    /* .pipe(uglify()) */
    .pipe(concat(buildMainFile))
    .pipe(dest(paths.scripts.dest));
}

function watchs() {
  watch(paths.scripts.src, scripts);
}

function deploy() {
  var candyman = new Candyman(candymanConfig);
  return candyman.deploy();
}

/*
 * Specify if tasks run in series or parallel using `gulp.series` and `gulp.parallel`
 */
var build = series(clean, parallel(scripts));

/*
 * You can use CommonJS `exports` module notation to declare tasks
 */
exports.clean = clean;
exports.scripts = scripts;
exports.watch = watchs;
exports.build = build;
exports.deploy = series(build, deploy);
/*
 * Define default task that can be called by just running `gulp` from cli
 */
exports.default = build;
