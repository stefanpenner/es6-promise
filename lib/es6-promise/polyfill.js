/*global self*/
import Promise from './promise';

export default function polyfill() {
  var local = (typeof global !== 'undefined') ? global : self;

  if (!(local.Promise && !local.Promise.cast)) {
    local.Promise = Promise;
  }
}
