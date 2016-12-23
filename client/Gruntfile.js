/*
 * @author christian.oetterli
 */

'use strict';

module.exports = function (grunt) {

    // Load grunt tasks automatically
    require('load-grunt-tasks')(grunt);

    // Time how long tasks take. Can help when optimizing build times
    require('time-grunt')(grunt);

    var gruntUtil = require('./grunt-util');

    // Define the configuration for all the tasks
    grunt.initConfig({

        ts: {
            base: { tsconfig: true, options: { fast: 'never', sourceMap: false } }
        },

        tslint: {
            options: {
                configuration: grunt.file.readJSON("tslint.json")
            },

            base: {
                files: {
                    src: ['app/**/!(*.d).ts']
                }
            }
        },

        clean: {
            dist: {
                files: [{
                    dot: true,
                    src: [
                        '.tmp',
                        '.dist/{,*/}*',
                        '!.dist/.git{,*/}*'
                    ]
                }]
            },
            jssources: {
                files: [{ src: ['app/**/*.js', 'app/**/*.js.map'] }],
                options: { force: true }
            }
        },

        filerev: {
            dist: {
                src: [
                    '.dist/app/{,*/}*.js',
                    '.dist/assets/{,*/}*.css',
                ]
            }
        },

        // Reads HTML for usemin blocks to enable smart builds that automatically
        // concat, minify and revision files. Creates configurations in memory so
        // additional tasks can operate on them
        useminPrepare: {
            html: 'assets/index.html',
            options: {
                dest: '.dist',
                flow: {
                    html: {
                        steps: {
                            js: ['concat', 'uglifyjs'],
                            css: ['cssmin']
                        },
                        post: {}
                    }
                }
            }
        },

        cssmin: {
            options: {
                restructuring: false // speeds up minify by factor 20 - approx. same output size
            }
        },

        // Performs rewrites based on filerev and the useminPrepare configuration
        usemin: {
            html: ['.tmp/assets/index.html'],
            css: ['.tmp/styles/{,*/}*.css'],
            options: {
                assetsDirs: [
                    '.dist',
                    '.dist/images',
                    '.dist/styles'
                ]
            }
        },

        copy: {
            tmp: {
                files: [
                    {
                        expand: true,
                        cwd: 'assets',
                        src: '**',
                        dest: '.tmp/assets',
                    },
                    {
                        expand: true,
                        cwd: 'app',
                        src: 'system.config.js',
                        dest: '.tmp/app',
                    }
                ]
            },
            dist: {
                files: [
                    {
                        expand: true,
                        cwd: '.tmp',
                        src: ['assets/index.html'],
                        dest: '.dist',
                    },
                    {
                        expand: true,
                        cwd: 'node_modules/bootstrap/dist',
                        src: ['fonts/**'],
                        dest: '.dist/assets',
                    }
                ]
            }
        },

        sass: {
            dist: {
                files: {
                    'assets/styles/main.css': 'assets/sass/main.scss'
                }
            }
        },

        watch: {
            sass: {
                files: ['assets/sass/**/*.*css'],
                tasks: ['compileSass']
            },
        },
    });

    grunt.registerTask('compileTypeScript', [
        'clean:jssources',
        'ts:base'
    ]);

    grunt.registerTask('codeQuality', [
        'tslint:base'
    ]);

    grunt.registerTask('remove_source_mapping_url', 'Remove source mapping url', function () {
        gruntUtil.removeSourceMappingUrls(grunt);
    });

    grunt.registerTask('systemjs', 'SystemJS bundle', function () {
        var bundle = require('./system.bundle');
        bundle(grunt, this.async(), function (err) {
            grunt.fail.fatal('error while creating systemjs bundle');
        });
    });

    grunt.registerTask('fixFontUrls', 'fix font urls in main.css', function () {
        gruntUtil.fixFontUrls(grunt, 'assets/styles/main.css');
    });

    grunt.registerTask('compileSass', ['sass', 'fixFontUrls']);

    grunt.registerTask('insertProdModeScript', function () {
        const index = '.tmp/assets/index.html';
        grunt.file.write(index,
            grunt.file.read(index)
                .replace('<!-- PROD_MODE_SCRIPT_INSERTION_POINT -->', '<script>window.PROD_MODE = true;</script>'));
    });

    grunt.registerTask('build', [
        'clean:dist',
        'remove_source_mapping_url',
        'compileSass',
        'compileTypeScript',
        'tslint',
        // // 'karma',
        'systemjs',
        'copy:tmp',
        // // 'inlineLazyFolders',
        'useminPrepare',
        'concat',
        'cssmin',
        'uglify',
        'filerev',
        'usemin',
        'insertProdModeScript',
        'copy:dist',
        // 'clean:distScriptsAndStyles',
        // 'fixLinks'
    ]);
};
