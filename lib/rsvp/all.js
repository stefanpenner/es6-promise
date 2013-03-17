import { Promise } from "rsvp/promise";

function all(promises) {
  var i, results = [], resolve, reject;

  var allPromise = new Promise(function(allResolver, allRejecter) {
    resolve = allResolver;
    reject = allRejecter;
  });

  var remaining = promises.length;

  if (remaining === 0) {
    resolve([]);
  }

  var resolver = function(index) {
    return function(value) {
      resolveAll(index, value);
    };
  };

  var resolveAll = function(index, value) {
    results[index] = value;
    if (--remaining === 0) {
      resolve(results);
    }
  };

  var rejectAll = function(error) {
    reject(error);
  };

  for (i = 0; i < promises.length; i++) {
    if (promises[i] && typeof promises[i].then === 'function') {
      promises[i].then(resolver(i), rejectAll);
    } else {
      resolveAll(i, promises[i]);
    }
  }
  return allPromise;
}

export { all };