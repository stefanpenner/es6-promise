/* global toString */

import { Promise } from "./promise";
import { isArray } from "./utils";

function race(promises, label) {
  if (!isArray(promises)) {
    throw new TypeError('You must pass an array to race.');
  }
  return new Promise(function(resolve, reject) {
    var results = [], promise;

    for (var i = 0; i < promises.length; i++) {
      promise = promises[i];

      if (promise && typeof promise.then === 'function') {
        promise.then(resolve, reject, "RSVP: RSVP#race");
      } else {
        resolve(promise);
      }
    }
  }, label);
}

export { race };
