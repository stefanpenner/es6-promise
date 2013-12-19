# ES6-Promises

This is a polyfill of [ES6 Promises](https://github.com/domenic/promises-unwrapping). The implementation is basically an API remapping of [rsvp.js](https://github.com/tildeio/rsvp.js).

For API details and how to use promises, see the <a href="http://www.html5rocks.com/en/tutorials/es6/promises/">JavaScript Promises HTML5Rocks article</a>.

## Downloads

* [promise](http://s3.amazonaws.com/es6-promises/promise-0.1.1.js)
* [promise-min](http://s3.amazonaws.com/es6-promises/promise-0.1.1.min.js) (~2k gzipped)

## Node.js

To install:

```sh
npm install es6-promise
```

To use:

```js
var Promise = require('es6-promise').Promise;
```

## Building & Testing

This package uses the [grunt-microlib](https://github.com/thomasboyt/grunt-microlib) package for building.

Custom tasks:

* `grunt test` - Run Mocha tests through Node and PhantomJS.
* `grunt test:phantom` - Run Mocha tests through PhantomJS (browser build).
* `grunt test:node` - Run Mocha tests through Node (CommonJS build).

TODO: docs will output wrong
