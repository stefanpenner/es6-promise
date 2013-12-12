import { Promise as RSVPPromise } from "./promise";
import { isFunction } from "./utils";

function polyfill() {
  var es6PromiseSupport = 
    "Promise" in window &&
    // Some of these methods are missing from
    // Firefox/Chrome experimental implementations
    "cast" in window.Promise &&
    "resolve" in window.Promise &&
    "reject" in window.Promise &&
    "all" in window.Promise &&
    "race" in window.Promise &&
    // Older version of the spec had a resolver object
    // as the arg rather than a function
    (function() {
      var resolve;
      new window.Promise(function(r) { resolve = r; });
      return isFunction(resolve);
    }());

  if (!es6PromiseSupport) {
    window.Promise = RSVPPromise;
  }
}

export { polyfill };
