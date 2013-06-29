import { Promise } from "./promise";

function objectOrFunction(x) {
  return typeof x === "function" || (typeof x === "object" && x !== null);
}

function resolve(thenable) {
  return new Promise(function(resolve, reject) {
    resolve(thenable);
  });
}

export { resolve };
