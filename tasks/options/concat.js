module.exports = {
  amd: {
    src: ['tmp/promise/**/*.amd.js', 'tmp/promise.amd.js'],
    dest: 'dist/promise-<%= pkg.version %>.amd.js',
    options: {
      banner: '/**\n' +
              '  @class RSVP\n' +
              '  @module RSVP\n' +
              '  */\n'
    }
  },

  amdNoVersion: {
    src: ['tmp/promise/**/*.amd.js', 'tmp/promise.amd.js'],
    dest: 'dist/promise.amd.js'
  },

  deps: {
    src: ['vendor/deps/*.js'],
    dest: 'tmp/deps.amd.js'
  },

  browser: {
    src: ['vendor/loader.js', 'tmp/promise/**/*.amd.js', 'tmp/promise.amd.js'],
    dest: 'tmp/promise.browser1.js'
  }
};
