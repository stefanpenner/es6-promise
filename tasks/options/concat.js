module.exports = {
  amd: {
    src: ['tmp/<%= pkg.name %>/**/*.amd.js', 'tmp/<%= pkg.name %>.amd.js'],
    dest: 'dist/<%= pkg.name %>-<%= pkg.version %>.amd.js'
  },

  amdNoVersion: {
    src: ['tmp/<%= pkg.name %>/**/*.amd.js', 'tmp/<%= pkg.name %>.amd.js'],
    dest: 'dist/<%= pkg.name %>.amd.js'
  },

  deps: {
    src: ['vendor/deps/*.js'],
    dest: 'tmp/deps.amd.js'
  },

  browser: {
    src: ['vendor/loader.js', 'tmp/<%= pkg.name %>/**/*.amd.js', 'tmp/<%= pkg.name %>.amd.js'],
    dest: 'tmp/<%= pkg.name %>.browser1.js'
  }
};
