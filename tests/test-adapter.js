/*global RSVP*/

(function(global) {
  'use strict';

  var Promise = require('./rsvp').Promise;
  var adapter;

  if (typeof process !== 'undefined' && {}.toString.call(process) === '[object process]') {
    adapter = exports;
  } else {
    global.adapter = adapter = {};
  }

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
})(this);
