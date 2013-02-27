/*global RSVP*/

'use strict';

var Promise;

if (typeof RSVP !== 'undefined') {
  // Test the browser build
  Promise = RSVP.Promise;
} else {
  // Test the Node build
  var Promise = require('../main').Promise;
}

var adapter = {};

adapter.fulfilled = function(value) {
  return new Promise(function(resolve, reject) {
    resolve(value);
  });
};

adapter.rejected = function(error) {
  return new Promise(function(resolve, reject) {
    reject(error);
  });
};

adapter.pending = function () {
  var pending = {};

  pending.promise = new Promise(function(resolve, reject) {
    pending.fulfill = resolve;
    pending.reject = reject;
  });

  return pending;
};

module.exports = global.adapter = adapter;
