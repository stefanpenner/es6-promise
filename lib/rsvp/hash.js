import { Promise } from "./promise";
import { isFunction } from './utils';

var keysOf = Object.keys || function(object) {
  var result = [];

  for (var prop in object) {
    result.push(prop);
  }

  return result;
};

/**
  `RSVP.hash` is similar to `RSVP.all`, but takes an object instead of an array
  for its `promises` argument.

  Returns a promise that is fulfilled when all the given promises have been
  fulfilled, or rejected if any of them become rejected. The returned promise
  is fulfilled with a hash that has the same key names as the `promises` object 
  argument. If any of the values in the object are not promises, they will
  simply be copied over to the fulfilled object.

  For example:

  ```javascript
  var promises = {
    myPromise: RSVP.resolve(1),
    yourPromise: RSVP.resolve(2),
    theirPromise: RSVP.resolve(3),
    notAPromise: 4
  };

  RSVP.hash(promises).then(function(hash){
    // hash here is an object that looks like:
    // {
    //   myPromise: 1,
    //   yourPromise: 2,
    //   theirPromise: 3,
    //   notAPromise: 4
    // }
  });
  ```

  If any of the `promises` given to `RSVP.hash` are rejected, the first promise
  that is rejected will be given as as the first argument, or as the reason to
  the rejection handler. For example:

  ```javascript
  var promises = {
    myPromise: RSVP.resolve(1),
    rejectedPromise: RSVP.reject(new Error("rejectedPromise")),
    anotherRejectedPromise: RSVP.reject(new Error("anotherRejectedPromise")),
  };

  RSVP.hash(promises).then(function(hash){
    // Code here never runs because there are rejected promises!
  }, function(reason) {
    // reason.message === "rejectedPromise"
  });
  ```

  An important note: `RSVP.hash` is intended for plain JavaScript objects that
  are just a set of keys and values. `RSVP.hash` will NOT preserve prototype
  chains.

  For example:

  ```javascript
  function MyConstructor(){
    this.example = RSVP.resolve("Example");
  }

  MyConstructor.prototype = {
    protoProperty: RSVP.resolve("Proto Property")
  };

  var myObject = new MyConstructor();

  RSVP.hash(myObject).then(function(hash){
    // protoProperty will not be present, instead you will just have an
    // object that looks like:
    // {
    //   example: "Example"
    // }
    //
    // hash.hasOwnProperty('protoProperty'); // false
    // 'undefined' === typeof hash.protoProperty
  });
  ```
  @module RSVP
  @argument {Object} promises
  @argument {String} label - optional string that describes the promise.
  Useful for tooling.
  @method hash
  @returns {Promise} promise that is fulfilled when all properties of `promises`
  have been fulfilled, or rejected if any of them become rejected.
*/
function hash(object, label) {
  var results = {},
      keys = keysOf(object),
      remaining = keys.length;

  return new Promise(function(resolve, reject){
    var promise, prop;

    if (remaining === 0) {
      resolve({});
      return;
    }

    var resolver = function(prop) {
      return function(value) {
        resolveAll(prop, value);
      };
    };

    var resolveAll = function(prop, value) {
      results[prop] = value;
      if (--remaining === 0) {
        resolve(results);
      }
    };


    for (var i = 0, l = keys.length; i < l; i ++) {
      prop = keys[i];
      promise = object[prop];

      if (promise && isFunction(promise.then)) {
        promise.then(resolver(prop), reject, "RSVP: RSVP#hash");
      } else {
        resolveAll(prop, promise);
      }
    }
  });
}

export { hash };
