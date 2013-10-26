module.exports = {
  browser: {
    options: {
      mangle: true
    },
    files: {
      'dist/<%= pkg.name %>-<%= pkg.version %>.min.js': ['dist/<%= pkg.name %>-<%= pkg.version %>.js'],
    }
  },
  browserNoVersion: {
    options: {
      mangle: true
    },
    files: {
      'dist/<%= pkg.name %>.min.js': ['dist/<%= pkg.name %>.js'],
    }
  }
};
