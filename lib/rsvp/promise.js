import { config } from "./config";
import { EventTarget } from "./events";
import { cast } from './cast';

function objectOrFunction(x) {
  return isFunction(x) || (typeof x === "object" && x !== null);
}

function isFunction(x){
  return typeof x === "function";
}

var guidKey = 'rsvp_' + new Date().getTime() + '-'; 
var counter = 0;

function Promise(resolver, label) {
  var promise = this;

  if (typeof resolver !== 'function') {
    throw new TypeError('You must pass a resolver function as the sole argument to the promise constructor');
  }

  if (!(promise instanceof Promise)) {
    throw new TypeError("Failed to construct 'Promise': Please use the 'new' operator, this object constructor cannot be called as a function.");
  }

  this._label = label;

  var resolvePromise = function(value) {
    resolve(promise, value);
  };

  var rejectPromise = function(value) {
    reject(promise, value);
  };

  this._subscribers = [];
  this._id = counter++;

  if (Promise.instrument) {
    instrument('created', promise);
  }

  try {
    resolver(resolvePromise, rejectPromise);
  } catch(e) {
    rejectPromise(e);
  }
}

function invokeCallback(settled, promise, callback, detail) {
  var hasCallback = isFunction(callback),
      value, error, succeeded, failed;

  if (hasCallback) {
    try {
      value = callback(detail);
      succeeded = true;
    } catch(e) {
      failed = true;
      error = e;
    }
  } else {
    value = detail;
    succeeded = true;
  }

  if (handleThenable(promise, value)) {
    return;
  } else if (hasCallback && succeeded) {
    resolve(promise, value);
  } else if (failed) {
    reject(promise, error);
  } else if (settled === FULFILLED) {
    resolve(promise, value);
  } else if (settled === REJECTED) {
    reject(promise, value);
  }
}

var PENDING   = void 0;
var SEALED    = 0;
var FULFILLED = 1;
var REJECTED  = 2;

function subscribe(parent, child, onFulfillment, onRejection) {
  var subscribers = parent._subscribers;
  var length = subscribers.length;

  subscribers[length] = child;
  subscribers[length + FULFILLED] = onFulfillment;
  subscribers[length + REJECTED]  = onRejection;
}

function publish(promise, settled) {
  var child, callback, subscribers = promise._subscribers, detail = promise._detail;

  if (Promise.instrument) {
    instrument(settled === FULFILLED ? 'fulfilled' : 'rejected', promise);
  }

  for (var i = 0; i < subscribers.length; i += 3) {
    child = subscribers[i];
    callback = subscribers[i + settled];

    invokeCallback(settled, child, callback, detail);
  }

  promise._subscribers = null;
}

Promise.prototype = {
  _id: undefined,
  _label: undefined,
  constructor: Promise,

  _state: undefined,
  _detail: undefined,
  _subscribers: undefined,

  _onerror: function (reason) {
    try {
      Promise.trigger('error', reason);
    } catch(error) {
      setTimeout(function(){
        throw error;
      }, 0);
    }
  },

  then: function(done, fail, label) {
    var promise = this;
    this._onerror = null;

    var thenPromise = new this.constructor(function() {}, label);

    if (this._state) {
      var callbacks = arguments;
      config.async(function() {
        invokeCallback(promise._state, thenPromise, callbacks[promise._state - 1], promise._detail);
      });
    } else {
      subscribe(this, thenPromise, done, fail);
    }

    if (Promise.instrument) {
      instrument('chained', promise, thenPromise);
    }

    return thenPromise;
  },

  fail: function(onRejection, label) {
    return this.then(null, onRejection, label);
  },

  'finally': function(callback) {
    var constructor = this.constructor;

    return this.then(function(value) {
      return constructor.cast(callback()).then(function(){
        return value;
      });
    }, function(reason) {
      return constructor.cast(callback()).then(function(){
        throw reason;
      });
    });
  }
};

Promise.prototype['catch'] = Promise.prototype.fail;
Promise.cast = cast;
Promise.instrument = false;

EventTarget.mixin(Promise); // instrumentation

function instrument(eventName, promise, child) {
  // instrumentation should not disrupt normal usage.
  try {
    config.trigger(eventName, {
      guid: guidKey + promise._id,
      eventName: eventName,
      detail: promise._detail,
      childGuid: child && child._id,
      label: promise._label
    });
  } catch(error) {
    setTimeout(function(){
      throw error;
    }, 0);
  }
}

function handleThenable(promise, value) {
  var then = null,
  resolved;

  try {
    if (promise === value) {
      throw new TypeError("A promises callback cannot return that same promise.");
    }

    if (objectOrFunction(value)) {
      then = value.then;

      if (isFunction(then)) {
        then.call(value, function(val) {
          if (resolved) { return true; }
          resolved = true;

          if (value !== val) {
            resolve(promise, val);
          } else {
            fulfill(promise, val);
          }
        }, function(val) {
          if (resolved) { return true; }
          resolved = true;

          reject(promise, val);
        }, 'Locked onto ' + (promise._label || ' unknown promise'));

        return true;
      }
    }
  } catch (error) {
    if (resolved) { return true; }
    reject(promise, error);
    return true;
  }

  return false;
}

function resolve(promise, value) {
  if (promise === value) {
    fulfill(promise, value);
  } else if (!handleThenable(promise, value)) {
    fulfill(promise, value);
  }
}

function fulfill(promise, value) {
  if (promise._state !== PENDING) { return; }
  promise._state = SEALED;
  promise._detail = value;

  config.async(publishFulfillment, promise);
}

function reject(promise, reason) {
  if (promise._state !== PENDING) { return; }
  promise._state = SEALED;
  promise._detail = reason;

  config.async(publishRejection, promise);
}

function publishFulfillment(promise) {
  publish(promise, promise._state = FULFILLED);
}

function publishRejection(promise) {
  if (promise._onerror) {
    promise._onerror(promise._detail);
  }

  publish(promise, promise._state = REJECTED);
}

export { Promise };
