module.exports = {
  browser: {
    options: {
      mangle: true
    },
    files: {
      'dist/promise-<%= pkg.version %>.min.js': ['dist/promise-<%= pkg.version %>.js'],
    }
  },
  browserNoVersion: {
    options: {
      mangle: true
    },
    files: {
      'dist/promise.min.js': ['dist/promise.js'],
    }
  }
};
