/*global self*/
import Promise from './promise';

export default function polyfill() {
  var local = Function('return this;')();
  var P = local.Promise;

  if (P && Object.prototype.toString.call(Promise.resolve()) === '[object Promise]' && !Promise.cast) {
    try {
      var K = function (r) { P.call(this, r); }
      K.prototype = Object.create(P.prototype);
      new K(function() { })
      return;
    } catch(e) {
      // Promise is not subclassable
    }
  }

  local.Promise = Promise;
}
