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


  var nativeES6PromiseSupported =
      P &&
      // Some of these methods are missing from  Firefox/Chrome experimental implementations
      'resolve' in P && 'reject' in P && 'all' in P && 'race' in P &&
      //deprecated API
      !('cast' in P) && !('from' in P ) &&
      // Older version of the spec had a resolver object as the arg rather than a function
      (function(){
          var resolve;
          new P(function(r){ resolve = r; });
          return typeof resolve === 'function';
      })();

  if (nativeES6PromiseSupported){
      return;
  }

  local.Promise = Promise;
}
