# ES6-Promise (subset of [rsvp.js](https://github.com/tildeio/rsvp.js))

This is a polyfill of the [ES6 Promise](http://people.mozilla.org/~jorendorff/es6-draft.html#sec-promise-constructor). The implementation is a subset of [rsvp.js](https://github.com/tildeio/rsvp.js), if you're wanting extra features and more debugging options, check out the [full library](https://github.com/tildeio/rsvp.js).

For API details and how to use promises, see the <a href="http://www.html5rocks.com/en/tutorials/es6/promises/">JavaScript Promises HTML5Rocks article</a>.

## Downloads

* [promise](http://s3.amazonaws.com/es6-promises/promise-1.0.0.js)
* [promise-min](http://s3.amazonaws.com/es6-promises/promise-1.0.0.min.js) (~1.9k gzipped)

## Node.js

To install:

```sh
npm install es6-promise
```

To use:

```js
var Promise = require('es6-promise').Promise;
```

## Usage in IE<9

`catch` is a reserved word in IE<9, meaning `promise.catch(func)` throws a syntax error. To work around this, use a string to access the property:

```js
promise['catch'](function(err) {
  // ...
});
```

Or use `.then` instead:

```js
promise.then(undefined, function(err) {
  // ...
});
```

## Auto-polyfill

To polyfill the global environment (either in Node or in the browser via CommonJS) use the following code snippet:

```js
require('es6-promise').polyfill();
```

Notice that we don't assign the result of `polyfill()` to any variable. The `polyfill()` method will patch the global environment (in this case to the `Promise` name) when called.

## Building & Testing

* `npm run build-all && npm test` - Run Mocha tests through Node and PhantomJS.
