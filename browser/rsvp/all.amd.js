define(
  ["rsvp/defer","exports"],
  function(__dependency1__, __exports__) {
    "use strict";
    var defer = __dependency1__.defer;

    function all(promises) {
      var results = [], deferred = defer(), remaining = promises.length;

      if (remaining === 0) {
        deferred.resolve([]);
      }

      var resolver = function(index) {
        return function(value) {
          resolveAll(index, value);
        };
      };

      var resolveAll = function(index, value) {
        results[index] = value;
        if (--remaining === 0) {
          deferred.resolve(results);
        }
      };

      var rejectAll = function(error) {
        deferred.reject(error);
      };

      for (var i = 0; i < promises.length; i++) {
        if (promises[i] && typeof promises[i].then === 'function') {
          promises[i].then(resolver(i), rejectAll);
        } else {
          resolveAll(i, promises[i]);
        }
      }
      return deferred.promise;
    }

    __exports__.all = all;
  });
