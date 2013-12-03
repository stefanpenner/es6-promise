module.exports = {
  compile: {
    name: '<%= pkg.name %>',
    description: '<%= pkg.description %>',
    version: '<%= pkg.version %>',
    url: '<%= pkg.homepage %>',
    options: {
      paths: 'lib',
      outdir: 'docs'
    }
  }
};
