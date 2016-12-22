/*
 * @author christian.oetterli
 */

'use strict';


module.exports = function (grunt) {

    // Load grunt tasks automatically
    require('load-grunt-tasks')(grunt);

    // Define the configuration for all the tasks
    grunt.initConfig({

        ts: {
            base: { tsconfig: true, options: { fast: 'never' } }
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
            jssources: {
                files: [{ src: ['app/**/*.js', 'app/**/*.js.map'] }],
                options: { force: true }
            }
        }
    });

    grunt.registerTask('compileTypeScript', [
        'clean:jssources',
        'ts:base'
    ]);

    grunt.registerTask('codeQuality', [
        'tslint:base'
    ]);

    grunt.registerTask('build', [
        'compileTypeScript',
        'tslint'
    ]);

};
