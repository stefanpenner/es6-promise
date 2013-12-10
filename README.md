# ES6-Promises

This is a polyfill of [ES6 Promises](https://github.com/domenic/promises-unwrapping), which is basically a remapping of [rsvp.js](https://github.com/tildeio/rsvp.js).

TODO: downloads
TODO: point to html5rocks article.

## Building & Testing

This package uses the [grunt-microlib](https://github.com/thomasboyt/grunt-microlib) package for building.

Custom tasks:

* `grunt test` - Run Mocha tests through Node and PhantomJS.
* `grunt test:phantom` - Run Mocha tests through PhantomJS (browser build).
* `grunt test:node` - Run Mocha tests through Node (CommonJS build).
* `grunt docs` - Run YUIDoc, outputting API documentation to `docs` folder.
