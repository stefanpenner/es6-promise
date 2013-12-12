# ES6-Promises

This is a polyfill of [ES6 Promises](https://github.com/domenic/promises-unwrapping), which is basically a remapping of [rsvp.js](https://github.com/tildeio/rsvp.js).

TODO: point to html5rocks article

## Downloads

* [promise](http://s3.amazonaws.com/es6-promises/promise-2.0.4.js)
* [promise-min](http://s3.amazonaws.com/es6-promises/promise-2.0.4.min.js) (~2k gzipped)

## Building & Testing

This package uses the [grunt-microlib](https://github.com/thomasboyt/grunt-microlib) package for building.

Custom tasks:

* `grunt test` - Run Mocha tests through Node and PhantomJS.
* `grunt test:phantom` - Run Mocha tests through PhantomJS (browser build).
* `grunt test:node` - Run Mocha tests through Node (CommonJS build).

TODO: docs will output wrong
