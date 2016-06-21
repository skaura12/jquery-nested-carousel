var options = {
    "src": "src",
    "dist": "dist"
};

var gulp = require("gulp"),
    uglify = require("gulp-uglify"),
    rename = require("gulp-rename"),
    sass = require("gulp-sass"),
    del = require("del"),
    cssnano = require('gulp-cssnano');


gulp.task("scripts",function(){
    return gulp.src(options.src + "/**/*.js")
        .pipe(gulp.dest(options.dist))
        .pipe(uglify())
        .pipe(rename({ extname : '.min.js'}))
        .pipe(gulp.dest(options.dist));
});

gulp.task("styles",function(){
    return gulp.src(options.src + "/scss/**/*.scss")
        .pipe(sass())
        .pipe(gulp.dest(options.dist + '/css'))
        .pipe(cssnano())
        .pipe(rename({ extname : '.min.css'}))
        .pipe(gulp.dest(options.dist + '/css'));
});

gulp.task("other",function(){
    return gulp.src([
        options.src + "/**/*",
        "!"+ options.src+ "/**/*.{html,css,js,scss}"
    ],{ nodir : true})
        .pipe(gulp.dest(options.dist))
});

gulp.task("clean", function () {
    return del.sync(options.dist);
});

gulp.task("default",["clean"],function(){
    console.log("Building!!");
    gulp.start("build");
});

gulp.task("build",["scripts","styles","other"],function(){
    gulp.watch(options.src + "/scss/**/*.scss",["styles"]);
    gulp.watch(options.src + "/**/*.js",["scripts"]);
});