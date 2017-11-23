module.exports = function(grunt) {
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    uglify: {
      options: {
          position: 'top',
          mangle:{
            toplevel:true
          },
          banner: '/*! <%= pkg.description %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
      },
      build: {
        src: 'src/fgo.js',
        dest: 'dist/fgo.min.js'
      }
    },

    watch: {
        options: {
            spawn: false,
            debounceDelay: 250
        },
        scripts: {
            files: ['src/*.js'],
            tasks: ['uglify','copy']
        },
        grunt: {
            files: ['Gruntfile.js']
        }
    },

    copy: {
      main: {
        expand: true,
        cwd: 'src',
        src: 'src/**',
        dest: 'dist/',
        flatten: true,
        filter: 'isFile'
      }
    }

  });
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-copy');

  grunt.registerTask('default', ['watch']);
}