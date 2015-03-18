import {
  noop,
  subscribe,
  invokeCallback,
  FULFILLED,
  REJECTED
} from '../-internal';

import asap from '../asap';

export default function Then(onFulfillment, onRejection) {
  if (this.then !== Then) { return this.then.apply(this, arguments); }

  var parent = this;
  var state = parent._state;

  if (state === FULFILLED && !onFulfillment || state === REJECTED && !onRejection) {
    return this;
  }

  var child = new this.constructor(noop);
  var result = parent._result;

  if (state) {
    var callback = arguments[state - 1];
    asap(function(){
      invokeCallback(state, child, callback, result);
    });
  } else {
    subscribe(parent, child, onFulfillment, onRejection);
  }

  return child;
}
