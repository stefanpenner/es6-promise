import { Promise } from "./promise";

function objectOrFunction(x) {
  return typeof x === "function" || (typeof x === "object" && x !== null);
}

function resolve(thenable) {
  if (thenable instanceof Promise) {
    return thenable;
  }

  var promise = new Promise(function(resolve, reject) {
    var then;

    try {
      if ( objectOrFunction(thenable) ) {
        then = thenable.then;

        if (typeof then === "function") {
          then.call(thenable, resolve, reject);
        } else {
          resolve(thenable);
        }

      } else {
        resolve(thenable);
      }

    } catch(error) {
      reject(error);
    }
  });

  return promise;
}

export { resolve };
