/* jshint node:true, undef:true, unused:true */
var AMDFormatter     = require('es6-module-transpiler-amd-formatter');
var closureCompiler  = require('broccoli-closure-compiler');
var compileModules   = require('broccoli-compile-modules');
var mergeTrees       = require('broccoli-merge-trees');
var moveFile         = require('broccoli-file-mover');
var es3Recast        = require('broccoli-es3-safe-recast');
var concat           = require('broccoli-concat');
var replace          = require('broccoli-string-replace');
var calculateVersion = require('./lib/calculateVersion');
var path             = require('path');
var trees            = [];
var env              = process.env.EMBER_ENV || 'development';

var bundle = compileModules('lib', {
  inputFiles: ['es6-promise.umd.js'],
  output: '/es6-promise.js',
  formatter: 'bundle',
});

trees.push(bundle);
trees.push(compileModules('lib', {
  inputFiles: ['**/*.js'],
  output: '/amd/',
  formatter: new AMDFormatter()
}));

if (env === 'production') {
  trees.push(closureCompiler(moveFile(bundle, {
    srcFile: 'es6-promise.js',
    destFile: 'es6-promise.min.js'
  }), {
    compilation_level: 'ADVANCED_OPTIMIZATIONS',
    externs: ['node'],
  }));
}

var distTree = mergeTrees(trees.concat('config'));
var distTrees = [];

distTrees.push(concat(distTree, {
  inputFiles: [
    'versionTemplate.txt',
    'es6-promise.js'
  ],
  outputFile: '/es6-promise.js'
}));

if (env === 'production') {
  distTrees.push(concat(distTree, {
    inputFiles: [
      'versionTemplate.txt',
      'es6-promise.min.js'
    ],
    outputFile: '/es6-promise.min.js'
  }));
}

if (env !== 'development') {
  distTrees = distTrees.map(es3Recast);
}

distTree = mergeTrees(distTrees);
var distTree = replace(distTree, {
  files: [
    'es6-promise.js',
    'es6-promise.min.js'
  ],
  pattern: {
    match: /VERSION_PLACEHOLDER_STRING/g,
    replacement: calculateVersion()
  }
});

module.exports = distTree;
