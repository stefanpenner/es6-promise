"use strict";

var Promise = require("../../../lib/rsvp").Promise;

exports.fulfilled = function(value) {
  var promise = new Promise();
  promise.resolve(value);
  return promise;
};

exports.rejected = function(error) {
  var promise = new Promise();
  promise.reject(error);
  return promise;
};

exports.pending = function () {
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

exports.throws = true;
