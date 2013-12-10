/*global RSVP*/

var resolve, reject;

if (typeof Promise !== 'undefined') {
  // Test the browser build
  resolve = Promise.resolve;
  reject = Promise.reject;
} else {
  // Test the Node build
  Promise = require('../dist/commonjs/main').Promise;
  assert = require('./vendor/assert');
  resolve = Promise.resolve;
  reject = Promise.reject;
}

if (typeof window === 'undefined' && typeof global !== 'undefined') {
  window = global;
}

module.exports = global.adapter = {
  resolved: resolve,
  rejected: reject,
  deferred: function defer() {
    var deferred = {
      // pre-allocate shape
      resolve: undefined,
      reject:  undefined,
      promise: undefined
    };

    deferred.promise = new Promise(function(resolve, reject) {
      deferred.resolve = resolve;
      deferred.reject = reject;
    });

    return deferred;
  }
};
