module.exports = {
  dist: {
    src: 'tmp/<%= pkg.name %>.browser1.js',
    dest: 'dist/<%= pkg.name %>-<%= pkg.version %>.js'
  },
  distNoVersion: {
    src: 'tmp/<%= pkg.name %>.browser1.js',
    dest: 'dist/<%= pkg.name %>.js'
  }
};
