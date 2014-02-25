/*global self*/
import { Promise as RSVPPromise } from "./promise";
import { isFunction } from "./utils";

function polyfill() {
  var local;

  if (typeof global !== 'undefined') {
    local = global;
  } else {
    local = typeof window !== 'undefined' ? window : self;
  }

  var es6PromiseSupport = 
    "Promise" in local &&
    // Some of these methods are missing from
    // Firefox/Chrome experimental implementations
    "cast" in local.Promise &&
    "resolve" in local.Promise &&
    "reject" in local.Promise &&
    "all" in local.Promise &&
    "race" in local.Promise &&
    // Older version of the spec had a resolver object
    // as the arg rather than a function
    (function() {
      var resolve;
      new local.Promise(function(r) { resolve = r; });
      return isFunction(resolve);
    }());

  if (!es6PromiseSupport) {
    local.Promise = RSVPPromise;
  }
}

export { polyfill };
