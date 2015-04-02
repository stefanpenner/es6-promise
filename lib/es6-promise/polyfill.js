/*global self*/
import Promise from './promise';

export default function polyfill() {
  var local = (typeof global !== 'undefined') ? global : self,
      P = local.Promise;

  if (P && Object.prototype.toString.call(P.resolve()) === '[object Promise]' && !P.cast) {
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
