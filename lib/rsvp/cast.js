/**
  `RSVP.cast` returns the same object, unless the object value being
  passed in is not an object. In that case, a promise will be returned
  that will become fulfilled with the passed value.

  Casting an object returns the same object:

  ```javascript

  var promise = RSVP.resolve(1);
  var casted = RSVP.Promise.cast(promise);

  console.log(promise === casted); // true

  ```

  Casting something other than an object returns a promise for the argument
  value:

  ```javascript

  var value = 1;
  var casted = RSVP.Promise.cast(value);

  console.log(value === casted); // false
  console.log(casted instanceof RSVP.Promise) // true

  ```

  @method cast
  @for RSVP
  @param {Object} object to be casted
  @return {Object | Promise} promise that is fulfilled when all properties of `promises`
  have been fulfilled, or rejected if any of them become rejected.
*/


function cast(object) {
  /*jshint validthis:true */
  if (object && typeof object === 'object' && object.constructor === this) {
    return object;
  }

  var Promise = this;

  return new Promise(function(resolve) {
    resolve(object);
  });
}

export { cast };
