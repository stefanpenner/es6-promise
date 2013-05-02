define(
  ["rsvp/promise","exports"],
  function(__dependency1__, __exports__) {
    "use strict";
    var Promise = __dependency1__.Promise;


    function objectOrFunction(x) {
      return typeof x === "function" || (typeof x === "object" && x !== null);
    }


    function reject(reason) {
      return new Promise(function (resolve, reject) {
        reject(reason);
      });
    }


    __exports__.reject = reject;
  });
