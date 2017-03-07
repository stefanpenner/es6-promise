/* jshint node:true, undef:true, unused:true */
var Rollup   = require('broccoli-rollup');
var Babel    = require('broccoli-babel-transpiler');
var merge    = require('broccoli-merge-trees');
var uglify   = require('broccoli-uglify-js');
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

var json3     = mv(find('node_modules/json3/lib/{json3.js}'), 'node_modules/json3/lib/', 'test/');
// mocha doesn't browserify correctly
var mocha     = mv(find('node_modules/mocha/mocha.{js,css}'), 'node_modules/mocha/',    'test/');

var testVendor = merge([ json3, mocha ]);


var es5 = new Babel(lib, {
  blacklist: ['es6.modules']
});

function rollupConfig(entry) {
  return new Rollup(es5, {
    rollup: {
      entry: 'lib/' + entry,
      targets: [
        {
          format: 'umd',
          moduleName: 'ES6Promise',
          dest: entry,
          sourceMap: 'inline'
        }
      ]
    }
  });
}

// build RSVP itself
var es6Promise = rollupConfig('es6-promise.js')
var es6PromiseAuto = rollupConfig('es6-promise.auto.js')

var testBundle = watchify(merge([
  mv(es6Promise, 'test'),
  testDir
]), {
  browserify: { debug: true, entries: ['./test/index.js'] }
});

var header = stew.map(find('config/versionTemplate.txt'), function(content) {
  return content.replace(/VERSION_PLACEHOLDER_STRING/, version());
});

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
  var result;
  env('production', function(){
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
