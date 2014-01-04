import { Promise as RSVPPromise } from "./promise";
import { isFunction } from "./utils";

function polyfill() {
  var es6PromiseSupport = 
    "Promise" in global &&
    // Some of these methods are missing from
    // Firefox/Chrome experimental implementations
    "cast" in global.Promise &&
    "resolve" in global.Promise &&
    "reject" in global.Promise &&
    "all" in global.Promise &&
    "race" in global.Promise &&
    // Older version of the spec had a resolver object
    // as the arg rather than a function
    (function() {
      var resolve;
      new global.Promise(function(r) { resolve = r; });
      return isFunction(resolve);
    }());

  if (!es6PromiseSupport) {
    global.Promise = RSVPPromise;
  }
}

export { polyfill };
