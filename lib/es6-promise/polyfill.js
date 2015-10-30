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

  var P = local.Promise,
      promiseName = Object.prototype.toString.call(P.resolve());

  if ( P && !P.cast &&
      (
        promiseName === '[object Promise]' && local.Symbol
        ||
        promiseName === '[object Object]'
      )
  ) {
    return;
  }

  local.Promise = Promise;
}
