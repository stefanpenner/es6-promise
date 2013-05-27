import { Promise } from "./promise";


function objectOrFunction(x) {
  return typeof x === "function" || (typeof x === "object" && x !== null);
}


function reject(reason) {
  return new Promise(function (resolve, reject) {
    reject(reason);
  });
}

export { reject };
