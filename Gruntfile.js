module.exports = function(grunt) {

    // Project configuration.
    grunt.initConfig({

        pkg: grunt.file.readJSON('package.json'),

        requirejs: {

            'compile-employer': {
                options: {
                    baseUrl: "./public/js",
                    name: "employer/boot",
                    out: "./public/js/employer/boot-built.js",
                    preserveLicenseComments: false,
                    mainConfigFile: "./public/js/employer/boot.js"
                }
            },

            'compile-employee': {
                options: {
                    baseUrl: "./public/js",
                    name: "engineer/boot",
                    out: "./public/js/engineer/boot-built.js",
                    preserveLicenseComments: false,
                    mainConfigFile: "./public/js/engineer/boot.js"
                }
            },

            'compile-admin': {
                options: {
                    baseUrl: "./public/js",
                    name: "admin/boot",
                    out: "./public/js/admin/boot-built.js",
                    preserveLicenseComments: false,
                    mainConfigFile: "./public/js/admin/boot.js"
                }
            },

            'compile-landing': {
                options: {
                    baseUrl: "./public/js",
                    name: "landing/boot",
                    out: "./public/js/landing/boot-built.js",
                    preserveLicenseComments: false,
                    mainConfigFile: "./public/js/landing/boot.js"
                }
            }
        },
        
        jshint: {
            options: {
                ignores: ['public/js/lib/**', 'public/js/require.min.js']
            },
            all: ['app/**/*.js', 'config/**/*.js', 'public/js/']
        }
    });

    // Load the plugin that provides the "requirejs" task.
    grunt.loadNpmTasks('grunt-contrib-requirejs');

    // Load the plugin that provides the "jshint" task.
    grunt.loadNpmTasks('grunt-contrib-jshint');

    // Default task(s).
    grunt.registerTask('default', ['requirejs']);

};