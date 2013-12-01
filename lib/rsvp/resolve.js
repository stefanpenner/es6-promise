import { Promise } from "./promise";

/**
  `RSVP.resolve` returns a promise that will become fulfilled with the passed
  `value`. `RSVP.resolve` is essentially shorthand for the following:

  ```javascript

  var promise = new RSVP.Promise(function(resolve, reject){
    resolve(1);
  });

  promise.then(function(value){
    // value === 1
  });
  ```

  Instead of writing the above, your code now simply becomes the following:

  ```javascript
  var promise = RSVP.resolve(1);

  promise.then(function(value){
    // value === 1
  });
  ```

  @method resolve
  @for RSVP
  @param {Any} value value that the returned promise will be resolved with
  @param {String} label optional string for identifying the returned promise.
  Useful for tooling.
  @returns {Promise} a promise that will become fulfilled with the given
  `value`
*/
function resolve(value, label) {
  return new Promise(function(resolve, reject) {
    resolve(value);
  }, label);
}

export { resolve };
