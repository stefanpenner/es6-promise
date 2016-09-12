var assert = require('assert');
var Promise = require('./es6-promise');

assert(typeof Promise.polyfill === 'function')
assert(typeof Promise.Promise === 'function')
assert(Promise.Promise === Promise)

function defer() {
  var deferred = {};

  deferred.promise = new Promise(function(resolve, reject) {
    deferred.resolve = resolve;
    deferred.reject = reject;
  });

  return deferred;
}

new Function('return this;')().adapter = {
  resolved: function(a) { return Promise.resolve(a); },
  rejected: function(a) { return Promise.reject(a);  },
  deferred: defer,
  Promise: Promise
};
