module.exports = {
  dist: {
    src: 'tmp/promise.browser1.js',
    dest: 'dist/promise-<%= pkg.version %>.js'
  },
  distNoVersion: {
    src: 'tmp/promise.browser1.js',
    dest: 'dist/promise.js'
  }
};
