module.exports = (grunt) ->
  
  grunt.task.loadTasks 'gruntcomponents/tasks'
  grunt.task.loadNpmTasks 'grunt-contrib-coffee'
  grunt.task.loadNpmTasks 'grunt-contrib-watch'
  grunt.task.loadNpmTasks 'grunt-contrib-concat'
  grunt.task.loadNpmTasks 'grunt-contrib-uglify'

  grunt.initConfig

    pkg: grunt.file.readJSON('package.json')
    banner: """
/*! <%= pkg.name %> (<%= pkg.repository.url %>)
 * lastupdate: <%= grunt.template.today("yyyy-mm-dd") %>
 * version: <%= pkg.version %>
 * author: <%= pkg.author %>
 * License: MIT */

"""

    growl:

      ok:
        title: 'COMPLETE!!'
        msg: '＼(^o^)／'

    coffee:

      easescroller:
        src: [ 'jquery.easescroller.coffee' ]
        dest: 'jquery.easescroller.js'

    concat:

      banner:
        options:
          banner: '<%= banner %>'
        src: [ '<%= coffee.easescroller.dest %>' ]
        dest: '<%= coffee.easescroller.dest %>'
        
    uglify:

      options:
        banner: '<%= banner %>'
      easescroller:
        src: '<%= concat.banner.dest %>'
        dest: 'jquery.easescroller.min.js'

    watch:

      easescroller:
        files: '<%= coffee.easescroller.src %>'
        tasks: [
          'default'
        ]

  grunt.registerTask 'default', [
    'coffee'
    'concat'
    'uglify'
    'growl:ok'
  ]

