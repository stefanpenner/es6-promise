import { Promise } from "./promise";

function reject(reason, label) {
  return new Promise(function (resolve, reject) {
    reject(reason);
  }, label);
}

export { reject };
