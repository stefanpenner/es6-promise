import { Promise } from "./promise";
import { all } from "./all";

function makeNodeCallbackFor(resolve, reject) {
  return function (error, value) {
    if (error) {
      reject(error);
    } else if (arguments.length > 2) {
      resolve(Array.prototype.slice.call(arguments, 1));
    } else {
      resolve(value);
    }
  };
}

function denodeify(nodeFunc, binding) {
  return function()  {
    var nodeArgs = Array.prototype.slice.call(arguments), resolve, reject;
    var thisArg = this || binding;

    return new Promise(function(resolve, reject) {
      all(nodeArgs).then(function(nodeArgs) {
        try {
          nodeArgs.push(makeNodeCallbackFor(resolve, reject));
          nodeFunc.apply(thisArg, nodeArgs);
        } catch(e) {
          reject(e);
        }
      });
    });
  };
}

export { denodeify };
