module.exports = function(grunt) {
  // Load grunt-microlib config & tasks
  var emberConfig = require('grunt-microlib').init.bind(this)(grunt);
  grunt.loadNpmTasks('grunt-microlib');

  // Custom phantomjs test task
  this.registerTask('test:phantom', "Runs tests through the command line using PhantomJS", ['build', 'tests', 'mocha_phantomjs']);

  // Custom Node test task
  this.registerTask('test:node', ['build', 'tests', 'mochaTest']);

  this.registerTask('test', ['build', 'tests', 'mocha_phantomjs', 'mochaTest']);

  var config = {
    cfg: {
      // Name of the project
      name: 'rsvp.js',

      // Name of the root module (i.e. 'rsvp' -> 'lib/rsvp.js')
      barename: 'rsvp',

      // Name of the global namespace to export to
      namespace: 'RSVP'
    },

    pkg: grunt.file.readJSON('package.json'),

    browserify: {
      tests: {
        src: ['test/test-adapter.js',
              'node_modules/promises-aplus-tests/lib/tests/**/*.js',
              'node_modules/promises-aplus-tests/node_modules/sinon/lib/{sinon.js,sinon/*.js}'],
        dest: 'tmp/tests-bundle.js'
      }
    },

    mocha_phantomjs: {
      phantom: {
        options: {
          urls: ["test/index.html"],
        }
      }
    },

    mochaTest: {
      test: {
        src: ['test/vendor/assert.js', 'test/test-adapter.js', 'node_modules/promises-aplus-tests/lib/tests/**/*.js', 'tmp/tests.cjs.js'],
        options: {
          reporter: 'spec'
        },
      }
    }
  };

  // Merge config into emberConfig, overwriting existing settings
  grunt.initConfig(grunt.util._.merge(emberConfig, config));

  // Load custom tasks from NPM
  grunt.loadNpmTasks('grunt-browserify');
  grunt.loadNpmTasks('grunt-mocha-phantomjs');
  grunt.loadNpmTasks('grunt-mocha-test');
};
