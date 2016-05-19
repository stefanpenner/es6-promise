import Promise from './es6-promise/promise';
import polyfill from './es6-promise/polyfill';

Promise.Promise = Promise;
Promise.polyfill = polyfill;

/* global define:true module:true window: true */
if (typeof define === 'function' && define['amd']) {
  define(function() { return Promise; });
} else if (typeof module !== 'undefined' && module['exports']) {
  module['exports'] = Promise;
} else if (typeof this !== 'undefined') {
  this['ES6Promise'] = Promise;
}

polyfill();
