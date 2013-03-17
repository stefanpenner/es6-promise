define(
  ["rsvp/promise","exports"],
  function(__dependency1__, __exports__) {
    "use strict";
    var Promise = __dependency1__.Promise;

    function defer() {
      var deferred = {};

      var promise = new Promise(function(resolve, reject) {
        deferred.resolve = resolve;
        deferred.reject = reject;
      });

      deferred.promise = promise;
      return deferred;
    }

    __exports__.defer = defer;
  });
