/*global self*/
import Promise from './promise';

export default function polyfill() {
  var local;

  if (typeof global !== 'undefined') {
      local = global;
  } else if (typeof self !== 'undefined') {
      local = self;
  } else {
      try {
          local = Function('return this')();
      } catch (e) {
          throw new Error('polyfill failed because global object is unavailable in this environment');
      }
  }

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
