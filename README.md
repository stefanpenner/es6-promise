# ES6-Promises (subset of [rsvp.js](https://github.com/tildeio/rsvp.js))
[![Build Status](https://travis-ci.org/jakearchibald/es6-promise.svg?branch=master)](https://travis-ci.org/jakearchibald/es6-promise)

This is a polyfill of [ES6 Promises](https://github.com/domenic/promises-unwrapping). The implementation is a subset of [rsvp.js](https://github.com/tildeio/rsvp.js), if you're wanting extra features and more debugging options, check out the [full library](https://github.com/tildeio/rsvp.js).

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

## Building & Testing

* `npm run build-all && npm test` - Run Mocha tests through Node and PhantomJS.
