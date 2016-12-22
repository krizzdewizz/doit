var Builder = require('systemjs-builder');
var fs = require('fs');
var path = require('path');

var inlineResources = require('./grunt-util/inline').inlineResources;

var SYSTEM_CONFIG = './app/system.config.js';

// modules that shall inline resource: html, css, messages
var INLINE = ['/app', '/node_modules/bison-ui'];

// speed up app load time with pre-bundled vendor dependencies: all angular2 & dependencies but w/o bison-ui
var VENDOR_DEV_BUNDLE = 'app/vendor.dev.js';

// production build
var APP_BUNDLE = '.tmp/app/bundle.js';

module.exports = function (grunt, done, onError) {

    var opts = {
        runtime: false, minify: false, sourceMaps: false,

        fetch: function (load, fetch) {

            if (!load.name.endsWith('.js')) {
                return fetch(load);
            }

            var fileName = load.name.substring('file://'.length);
            var file = path.join(__dirname, fileName);
            var contents = String(fs.readFileSync(file));

            if (INLINE.find(function (it) {
                return fileName.startsWith(it);
            })) {
                contents = inlineResources(contents, file);
            }

            return contents;
        }
    };

    var sysConf = require(SYSTEM_CONFIG);
    var config = sysConf.SYSTEM_CONFIG('');
    var builder = new Builder(config);

    grunt.log.writeln('build prod bundle...');

    builder.bundle('app/main.js', opts).then(function (output) {

        grunt.file.write(APP_BUNDLE, output.source);

        grunt.log.writeln('build dev vendor bundle...');

        builder
            .bundle('app/main.js - [app/**/*]', opts)
            .then(function (output) {
                fs.writeFileSync(VENDOR_DEV_BUNDLE, output.source);
                done();
            }).catch(function (err) {
                grunt.log.error('error while building dev vendor bundle', err);
                onError();
            });
    }).catch(function (err) {
        grunt.log.error('error while building prod bundle', err);
        onError();
    });
};