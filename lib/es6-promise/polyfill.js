/*global self*/
import Promise from './promise';

import {
  isArray
} from './utils';

export default function polyfill() {
  var local;

  if (typeof global !== 'undefined') {
      local = global;
  } else if (typeof self !== 'undefined') {
      local = self;
  } else {
      try {
          local = Function('return this')();
      } catch (e) {
          throw new Error('polyfill failed because global object is unavailable in this environment');
      }
  }

  var P = local.Promise;

  if (P && Object.prototype.toString.call(P.resolve()) === '[object Promise]' && !P.cast) {
    return;
  } else if (P && P.toString().indexOf('[native code]') !== -1) {

    var wrapThennable = function (thennable) {
      return new local.Promise(function (resolve, reject) {
        try {
          thennable.then(resolve, reject);
        } catch (e) {
          resolve(thennable);
        }
      });
    };

    var isNonPromiseThennable = function (thing) {
      var isPromise = thing instanceof local.Promise;
      var isThennable = thing && typeof thing === 'object' && 'then' in thing;
      
      if (!isPromise && isThennable) {
        return true;
      }
      return false;
    };

    var originalAll = local.Promise.all;
    local.Promise.all = function (promises) {
      try {
        promises = promises.map(function (thing) {
          if (isNonPromiseThennable(thing)) {
            return wrapThennable(thing);
          }
          return thing;
        });
        return originalAll.call(local.Promise, promises);
      } catch (e) {
        return local.Promise.reject(e);
      }
    };

    var originalRace = local.Promise.race;

    local.Promise.race = function (promises) {
      if (!isArray(promises)) {
        return local.Promise.reject(new TypeError('You must pass an array to race.'));
      }
      return originalRace.call(local.Promise, promises);
    };
    
    var originalThen = local.Promise.prototype.then;
    local.Promise.prototype.then = function (onFulfilled, onRejected) {
      if (typeof onFulfilled !== 'function') {
        onFulfilled = undefined;
      }
      if (typeof onRejected !== 'function') {
        onRejected = undefined;
      }
      return originalThen.call(this, function (result) {
        if (onFulfilled) {
          result = onFulfilled(result);
          if (isNonPromiseThennable(result)) {
            return wrapThennable(result);
          }
        }
        return result;
      }, onRejected);
    };

    var originalResolve = local.Promise.resolve;
    local.Promise.resolve = function (thing) {
      try {
        if (isNonPromiseThennable(thing)) {
          return originalResolve.call(local.Promise, wrapThennable(Promise.resolve(thing)));
        }
      } catch (e) {
        return local.Promise.reject(e);
      }
      return originalResolve.call(local.Promise, thing);
    };

    return;
  }

  local.Promise = Promise;
}
