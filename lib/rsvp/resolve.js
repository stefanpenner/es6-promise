import { Promise } from "./promise";

function resolve(thenable, label) {
  return new Promise(function(resolve, reject) {
    resolve(thenable);
  }, label);
}

export { resolve };
