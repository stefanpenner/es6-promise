/*global self*/
import Promise from './promise';

export default function polyfill() {
  var local = (typeof global !== 'undefined') ? global : self;
  var P = local.Promise;

  if (P && Object.prototype.toString.call(P.resolve()) === '[object Promise]' && !P.cast) {
    return;
  }

  local.Promise = Promise;
}
