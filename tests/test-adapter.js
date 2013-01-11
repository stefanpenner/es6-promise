/*global RSVP*/

'use strict';

var Promise;

if (typeof RSVP !== 'undefined') {
  // Test the browser build
  Promise = RSVP.Promise;
} else {
  // Test the Node build
  var Promise = require('../node/rsvp').Promise;
}

var adapter = {};

adapter.fulfilled = function(value) {
  var promise = new Promise();
  promise.resolve(value);
  return promise;
};

adapter.rejected = function(error) {
  var promise = new Promise();
  promise.reject(error);
  return promise;
};

adapter.pending = function () {
  var promise = new Promise();

  return {
    promise: promise,
    fulfill: function(value) {
      promise.resolve(value);
    },
    reject: function(error) {
      promise.reject(error);
    }
  };
};

module.exports = global.adapter = adapter;
