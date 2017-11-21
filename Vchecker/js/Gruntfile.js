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
        dest: 'dest/fgo.min.js'
      }
    },

    watch: {
        options: {
            spawn: false,
            debounceDelay: 250
        },
        scripts: {
            files: ['src/*.js'],
            tasks: ['uglify']
        },
        grunt: {
            files: ['Gruntfile.js']
        }
    }

  });
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-watch');

  grunt.registerTask('watcher', 'watches js files and identicates changes', ['watch']);
}