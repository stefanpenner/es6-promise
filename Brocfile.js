var TypeScript= require('broccoli-typescript-compiler');
var Rollup  = require('broccoli-rollup');
var uglify   = require('broccoli-uglify-js');

var es = new TypeScript('lib',{
  files: ['index.ts'],
  tsconfig: {
    compilerOptions: {
      module: "es2015"
    }
  }
});
var es6 = new TypeScript('lib',{
  files: ['index.ts'],
  tsconfig: {
    compilerOptions: {
      target: 'es6',
      module: "es2015"
    }
  }
});
var es6Promise = new Rollup(es, {
  rollup: {
    entry: 'es6-promise.js',
    targets: [
      {
        format: 'umd',
        moduleName: 'ES6Promise',
        dest: 'es6-promise.js',
        sourceMap: 'inline'
      }
    ]
  }
});

/* jshint node:true, undef:true, unused:true */
var merge    = require('broccoli-merge-trees');
var version  = require('git-repo-version');
var watchify = require('broccoli-watchify');
var concat   = require('broccoli-concat');
var fs       = require('fs');

var stew   = require('broccoli-stew');

var find   = stew.find;
var mv     = stew.mv;
var rename = stew.rename;
var env    = stew.env;
var map    = stew.map;

var lib       = find('lib');

// test stuff
var testDir   = find('test');
var testFiles = find('test/{index.html,worker.js}');

// mocha doesn't browserify correctly
var mocha     = mv(find('node_modules/mocha/mocha.{js,css}'), 'node_modules/mocha/',    'test/');

var testVendor = mocha;

var testBundle = watchify(merge([
  mv(es6Promise, 'test'),
  testDir
]), {
  browserify: { debug: true, entries: ['./test/index.js'] }
});

var header = stew.map(find('config/versionTemplate.txt'), function(content) {
  return content.replace(/VERSION_PLACEHOLDER_STRING/, version());
});

var dist = es6Promise;

function concatAs(tree, outputFile) {
  return merge([
    concat(merge([tree, header]), {
      headerFiles: ['config/versionTemplate.txt'],
      inputFiles:  ['es6-promise.js'],
      outputFile: outputFile
    }),

    concat(merge([tree, header]), {
      headerFiles: ['config/versionTemplate.txt'],
      inputFiles:  ['es6-promise.js'],
      outputFile: outputFile.replace('es6-promise', 'es6-promise.auto'),
      footer:    'ES6Promise.polyfill();',
    }),

  ]);
}

function production(dist, header) {
  var result;
  env('production', function(){
    result = uglify(concatAs(dist, 'es6-promise.min.js'), {
      compress: true,
      mangle: true,
    });
  })
  return result;
}

function development(dist, header) {
  return concatAs(dist, 'es6-promise.js');
}

module.exports = merge([
  merge([
    production(es6Promise, header),
    development(es6Promise, header),
  ].filter(Boolean)),
  // test stuff
  testFiles,
  testVendor,
  mv(es6, 'esnext'),
  mv(testBundle, 'test')
]);
