var assert = require('assert');
var g = typeof window !== 'undefined' ?
               window : typeof global !== 'undefined' ? global : this;

var Promise = g.ES6Promise || require('./es6-promise').Promise;

function defer() {
  var deferred = {};

  deferred.promise = new Promise(function(resolve, reject) {
    deferred.resolve = resolve;
    deferred.reject = reject;
  });

  return deferred;
}
var resolve = Promise.resolve;
var reject = Promise.reject;


module.exports = g.adapter = {
  resolved: function(a) { return Promise.resolve(a); },
  rejected: function(a) { return Promise.reject(a);  },
  deferred: defer,
  Promise: Promise
};
