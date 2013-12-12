/*global RSVP*/

var resolve, reject;

function bind(func, thisVal) {
  if (func.bind) {
    return func.bind(thisVal);
  }
  return function() {
    return func.apply(thisVal, arguments);
  };
}

if (typeof Promise !== 'undefined') {
  // Test the browser build
  resolve = bind(Promise.resolve, Promise);
  reject = bind(Promise.reject, Promise);
} else {
  // Test the Node build
  Promise = require('../dist/commonjs/main').Promise;
  assert = require('./vendor/assert');
  resolve = bind(Promise.resolve, Promise);
  reject = bind(Promise.reject, Promise);
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
