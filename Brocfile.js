'use strict';

/* jshint node:true, undef:true, unused:true */
const Rollup   = require('broccoli-rollup');
const Babel    = require('broccoli-babel-transpiler');
const merge    = require('broccoli-merge-trees');
const uglify   = require('broccoli-uglify-js');
const version  = require('git-repo-version');
const watchify = require('broccoli-watchify');
const concat   = require('broccoli-concat');
const fs       = require('fs');

const stew   = require('broccoli-stew');

const find   = stew.find;
const mv     = stew.mv;
const rename = stew.rename;
const env    = stew.env;
const map    = stew.map;

const lib       = find('lib');

// test stuff
const testDir   = find('test');
const testFiles = find('test/{index.html,worker.js}');

const json3     = mv(find('node_modules/json3/lib/{json3.js}'), 'node_modules/json3/lib/', 'test/');
// mocha doesn't browserify correctly
const mocha     = mv(find('node_modules/mocha/mocha.{js,css}'), 'node_modules/mocha/',    'test/');

const testVendor = merge([ json3, mocha ]);


const es5 = new Babel(lib, {
  plugins: [
    'transform-es2015-arrow-functions',
    'transform-es2015-computed-properties',
    'transform-es2015-shorthand-properties',
    'transform-es2015-template-literals',
    'transform-es2015-parameters',
    'transform-es2015-destructuring',
    'transform-es2015-spread',
    'transform-es2015-block-scoping',
    'transform-es2015-constants',
    ['transform-es2015-classes', { loose: true }],
    'babel6-plugin-strip-class-callcheck'
  ]
});

function rollupConfig(entry) {
  return new Rollup(es5, {
    rollup: {
      input: 'lib/' + entry,
      output: [
        {
          format: 'umd',
          name: 'ES6Promise',
          file: entry,
          sourcemap: 'inline'
        }
      ]
    }
  });
}

// build RSVP itself
const es6Promise = rollupConfig('es6-promise.js')
const es6PromiseAuto = rollupConfig('es6-promise.auto.js')

const testBundle = watchify(merge([
  mv(es6Promise, 'test'),
  testDir
]), {
  browserify: { debug: true, entries: ['./test/index.js'] }
});

const header = stew.map(find('config/versionTemplate.txt'), content => content.replace(/VERSION_PLACEHOLDER_STRING/, version()));

function concatAs(outputFile) {
  return merge([
    concat(merge([es6Promise, header]), {
      headerFiles: ['config/versionTemplate.txt'],
      inputFiles:  ['es6-promise.js'],
      outputFile: outputFile
    }),

    concat(merge([es6PromiseAuto, header]), {
      headerFiles: ['config/versionTemplate.txt'],
      inputFiles:  ['es6-promise.auto.js'],
      outputFile: outputFile.replace('es6-promise', 'es6-promise.auto'),
    }),

  ]);
}

function production() {
  let result;
  env('production', () => {
    result = uglify(concatAs('es6-promise.min.js'), {
      compress: true,
      mangle: true,
    });
  })
  return result;
}

function development() {
  return concatAs('es6-promise.js');
}

module.exports = merge([
  merge([
    production(),
    development(),
  ].filter(Boolean)),
  // test stuff
  testFiles,
  testVendor,
  mv(testBundle, 'test')
]);
