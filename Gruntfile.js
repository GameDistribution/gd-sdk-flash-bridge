module.exports = function(grunt) {
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        /**
         * A code block that will be added to our minified code files.
         * Gets the name and appVersion and other info from the above loaded 'package.json' file.
         * @example <%= banner.join("\\n") %>
         */
        banner: [
            '/*',
            '* Project: <%= pkg.name %>',
            '* Description: <%= pkg.description %>',
            '* Development By: <%= pkg.author %>',
            '* Copyright(c): <%= grunt.template.today("yyyy") %>',
            '* Version: <%= pkg.version %> (<%= grunt.template.today("dd-mm-yyyy hh:mm") %>)',
            '*/',
        ],

        /**
         * Prepends the banner above to the minified files.
         */
        usebanner: {
            options: {
                position: 'top',
                banner: '<%= banner.join("\\n") %>',
                linebreak: true,
            },
            files: {
                src: [
                    'lib/main.min.js',
                ],
            },
        },

        /**
         * Do some javascript post processing, like minifying and removing comments.
         */
        uglify: {
            options: {
                position: 'top',
                linebreak: true,
                sourceMap: false,
                sourceMapIncludeSources: false,
                compress: {
                    sequences: true,
                    dead_code: true,
                    conditionals: true,
                    booleans: true,
                    unused: true,
                    if_return: true,
                    join_vars: true,
                },
                mangle: true,
                beautify: false,
                warnings: false,
            },
            lib: {
                src: 'Vchecker/js/fgo.js',
                dest: 'Vchecker/js/fgo.min.js',
            },
        },

        watch: {
            options: {
                spawn: false,
                debounceDelay: 250,
            },
            scripts: {
                files: ['Vchecker/js/*.js'],
                tasks: ['uglify'],
            },
            grunt: {
                files: ['Gruntfile.js'],
            },
        },

    });
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-banner');

    // Register tasks.
    grunt.registerTask('default', ['watch']);
    grunt.registerTask('build', ['uglify', 'usebanner', 'duration']);
    grunt.registerTask('duration',
        'Displays the duration of the grunt task up until this point.',
        function() {
            const date = new Date(Date.now() - startTS);
            let hh = date.getUTCHours();
            let mm = date.getUTCMinutes();
            let ss = date.getSeconds();
            if (hh < 10) {
                hh = '0' + hh;
            }
            if (mm < 10) {
                mm = '0' + mm;
            }
            if (ss < 10) {
                ss = '0' + ss;
            }
            console.log('Duration: ' + hh + ':' + mm + ':' + ss);
        });
};