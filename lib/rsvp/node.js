import { Promise } from "./promise";
import { all } from "./all";

var slice = Array.prototype.slice;

function makeNodeCallbackFor(resolve, reject) {
  return function (error, value) {
    if (error) {
      reject(error);
    } else if (arguments.length > 2) {
      resolve(slice.call(arguments, 1));
    } else {
      resolve(value);
    }
  };
}

/**
  `RSVP.denodeify` takes a "node-style" function and returns a function that
  will return an `RSVP.Promise`. You can use `denodeify` in Node.js or the
  browser when you'd prefer to use promises over using callbacks. For example,
  `denodeify` transforms the following:

  ```javascript
  var fs = require('fs');

  fs.readFile('myfile.txt', function(err, data){
    if (err) return handleError(err);
    handleData(data);
  });
  ```

  into:

  ```javascript
  var fs = require('fs');

  var readFile = RSVP.denodeify(fs.readFile);

  readFile('myfile.txt').then(handleData, handleError);
  ```

  Using `denodeify` makes it easier to compose asynchronous operations instead
  of using callbacks. For example, instead of:

  ```javascript
  var fs = require('fs');
  var log = require('some-async-logger');

  fs.readFile('myfile.txt', function(err, data){
    if (err) return handleError(err);
    fs.writeFile('myfile2.txt', data, function(err){
      if (err) throw err;
      log('success', function(err) {
        if (err) throw err;
      });
    });
  });
  ```

  You can chain the operations together using `then` from the returned promise:

  ```javascript
  var fs = require('fs');
  var denodeify = RSVP.denodeify;
  var readFile = denodeify(fs.readFile);
  var writeFile = denodeify(fs.writeFile);
  var log = denodeify(require('some-async-logger'));

  readFile('myfile.txt').then(function(data){
    return writeFile('myfile2.txt', data);
  }).then(function(){
    return log('SUCCESS');
  }).then(function(){
    // success handler
  }, function(reason){
    // rejection handler
  });
  ```

  @method denodeify
  @for RSVP
  @param {Function} nodeFunc a "node-style" function that takes a callback as
  its last argument. The callback expects an error to be passed as its first
  argument (if an error occurred, otherwise null), and the value from the
  operation as its second argument ("function(err, value){ }").
  @param {Any} binding optional argument for binding the "this" value when
  calling the `nodeFunc` function.
  @return {Function} a function that wraps `nodeFunc` to return an
  `RSVP.Promise`
*/
function denodeify(nodeFunc, binding) {
  return function()  {
    var nodeArgs = slice.call(arguments), resolve, reject;
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
