'use strict';
// const gulp = require('gulp'),
//     sass = require('gulp-sass')(require('sass')),
//     prefixer = require('gulp-autoprefixer'),
//     rimraf = require('rimraf'),
//     plumber = require('gulp-plumber'),
//     rigger = require('gulp-rigger'),
//     terser = require('gulp-terser'),
//     typograf = require('gulp-typograf'),
//     htmlmin = require('gulp-htmlmin'),
//     stripCssComments = require('gulp-strip-css-comments');

import gulp from 'gulp';
import dartSass from 'sass';
import gulpSass from 'gulp-sass';
const sass = gulpSass(dartSass);
import prefixer from 'gulp-autoprefixer';
import plumber from 'gulp-plumber';
import rigger from 'gulp-rigger';
import terser from 'gulp-terser';
import typograf from 'gulp-typograf';
import htmlmin from 'gulp-htmlmin';
import stripCssComments from 'gulp-strip-css-comments';

const path = {
    build: { // пути для сборки проектов
        all:'public/',
        js: 'public/js/',
        // jsplugins:'build/js/plugins/',
        scss: 'public/assets/css/',
        img: 'public/img/',
        favicons: 'public/favicons/',
        fonts: 'public/assets/fonts/',
        html: 'public/'
    },
    src: { // пути размещения исходных файлов проекта
        html: 'resources/pages/**/*.{html,htm}',
        js: 'resources/js/**/*.js',
        // jsplugins:'src/js/plugins/**/*.*',
        scss: 'resources/scss/main.scss',
        img: 'resources/img/**/*.*',
        favicons: 'resources/favicons/**/*.*',
        fonts: 'resources/fonts/**/*.*',
        json: 'resources/js/**/*.json'
    },
    watch: { // пути файлов, за изменением которых мы хотим наблюдать
        html: 'resources/pages/**/*.{html,htm}',
        // js: 'resources/js/**/*.js',
        js: 'resources/js/app.js',
        // jsplugins:'src/js/plugins/**/*.*',
        scss: 'resources/scss/**/*.scss',
        favicons: 'resources/favicons/**/*.*',
        img: 'resources/img/**/*.*'
    },
    filter:{ // выражения для фильтрации файлов
        fonts:'**/*.{ttf,otf,woff,woff2,eot,svg}'
    },
    clean: './build', // путь очистки директории для сборки
};

gulp.task('clean', function(done){
    rimraf(path.clean, done);
});

gulp.task('mv:fonts',function(done){
    gulp.src(path.src.fonts)
        .pipe(gulp.dest(path.build.fonts));
    done();
});

gulp.task('mv:json',function(done){
    gulp.src(path.src.json)
        .pipe(gulp.dest(path.build.js));
    done();
});

gulp.task('build:html',function(done){
    gulp.src(path.src.html)
        // .pipe(htmlmin({
        //     collapseWhitespace: true,
        //     removeComments:true,
        //     minifyJS:true
        // }))
        .pipe(typograf({ locale: ['ru', 'en-US'] }))
        .pipe(gulp.dest(path.build.html));
    done();
});

gulp.task('typo:html',function(done){
    gulp.src(path.src.html)
        .pipe(typograf({ locale: ['ru', 'en-US'] }))
        .pipe(gulp.dest(path.src.html));
    done();
});




gulp.task('build:scss',function(done){
    gulp.src(path.src.scss)
        .pipe(plumber())
        .pipe(sass({
            outputStyle:"compressed",
        }))
        .pipe(prefixer({
            cascade:false,
            remove:true
        }))
        .pipe(gulp.dest(path.build.scss));
    done();
});

gulp.task('dev:scss',function(done){
    gulp.src(path.src.scss,{sourcemaps:true})
        .pipe(plumber())
        .pipe(sass({
            outputStyle:"compressed",
        }))
        .pipe(prefixer({
            cascade:false,
            remove:true
        }))
        .pipe(gulp.dest(path.build.scss,{sourcemaps:'.'}));
    done();
});


gulp.task('build:js', function (done) {
    gulp.src(path.src.js) //main файл
        .pipe(rigger()) // rigger
        .pipe(terser()) //сжатие js
        .pipe(gulp.dest(path.build.js)) // готовый файл в build
    // .pipe(reload({stream: true})); //И перезагрузим сервер
    done();
});


// //TODO: Check build:img
//
gulp.task('build:img', function (done) {
    gulp.src(path.src.img) //Выберем наши картинки
        // .pipe(imagemin({ //Сожмем их
        //     progressive: true,
        //     svgoPlugins: [{removeViewBox: false}],
        //     use: [pngquant()],
        //     interlaced: true
        // }))
        .pipe(gulp.dest(path.build.img)) //И бросим в build
    // .pipe(reload({stream: true}));
    done();
});

gulp.task('mv:img',function(done){
    gulp.src(path.src.img)
        .pipe(gulp.dest(path.build.img))
        // .pipe(reload({stream: true}));
    done();
});
gulp.task('mv:jsplugins',function(done){
    gulp.src(path.src.jsplugins)
        .pipe(gulp.dest(path.build.jsplugins))
        // .pipe(reload({stream: true}));
    done();
});


gulp.task('mv:favicons',function(done){
    gulp.src(path.src.favicons)
        .pipe(gulp.dest(path.build.favicons))
        // .pipe(reload({stream: true}));
    done();
});



/* Watcher */
gulp.task('watch',function (done) {
    gulp.watch(path.watch.scss, gulp.series('build:scss'));
    gulp.watch(path.watch.html, gulp.series('build:html'));
    gulp.watch(path.watch.js, gulp.series('build:js'));
    //gulp.watch(path.watch.jsplugins, gulp.series('mv:jsplugins'));
    gulp.watch(path.watch.img, gulp.series('mv:img'));
    gulp.watch(path.watch.favicons, gulp.series('mv:favicons'));
    done();
});

gulp.task('default', gulp.parallel('build:html','build:scss', 'mv:fonts','mv:img','mv:favicons', 'build:js'));
