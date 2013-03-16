import { async } from "rsvp/async";
import { EventTarget } from "rsvp/events";

var config = {};
config.async = async;

var noop = function() {};

var Promise = function(resolver) {
  var promise = this;

  if (typeof resolver !== 'function') {
    throw new TypeError('You must pass a resolver function as the sole argument to the promise constructor');
  }

  if (!(promise instanceof Promise)) {
    return new Promise(resolver);
  }

  var resolvePromise = function(value) {
    resolve(promise, value);
    resolvePromise = noop;
    rejectPromise = noop;
  };

  var rejectPromise = function(value) {
    reject(promise, value);
    resolvePromise = noop;
    rejectPromise = noop;
  };

  this.on('promise:resolved', function(event) {
    this.trigger('success', { detail: event.detail });
  }, this);

  this.on('promise:failed', function(event) {
    this.trigger('error', { detail: event.detail });
  }, this);

  resolver(resolvePromise, rejectPromise);
};

var invokeCallback = function(type, promise, callback, event) {
  var hasCallback = typeof callback === 'function',
      value, error, succeeded, failed;

  if (hasCallback) {
    try {
      value = callback(event.detail);
      succeeded = true;
    } catch(e) {
      failed = true;
      error = e;
    }
  } else {
    value = event.detail;
    succeeded = true;
  }

  if (value && typeof value.then === 'function') {
    value.then(function(value) {
      resolve(promise, value);
    }, function(error) {
      reject(promise, error);
    });
  } else if (hasCallback && succeeded) {
    resolve(promise, value);
  } else if (failed) {
    reject(promise, error);
  } else if (type === 'resolve') {
    resolve(promise, value);
  } else if (type === 'reject') {
    reject(promise, value);
  }
};

Promise.prototype = {
  constructor: Promise,

  then: function(done, fail) {
    var thenPromise = new Promise(function() {});

    if (this.isFulfilled) {
      config.async(function() {
        invokeCallback('resolve', thenPromise, done, { detail: this.fulfillmentValue });
      }, this);
    }

    if (this.isRejected) {
      config.async(function() {
        invokeCallback('reject', thenPromise, fail, { detail: this.rejectedReason });
      }, this);
    }

    this.on('promise:resolved', function(event) {
      invokeCallback('resolve', thenPromise, done, event);
    });

    this.on('promise:failed', function(event) {
      invokeCallback('reject', thenPromise, fail, event);
    });

    return thenPromise;
  }
};

function resolve(promise, value) {
  if (value && typeof value.then === 'function') {
    value.then(function(val) {
      resolve(promise, val);
    }, function(val) {
      reject(promise, val);
    });
  } else {
    fulfill(promise, value);
  }
}

function fulfill(promise, value) {
  config.async(function() {
    promise.trigger('promise:resolved', { detail: value });
    promise.isFulfilled = true;
    promise.fulfillmentValue = value;
  });
}

function reject(promise, value) {
  config.async(function() {
    promise.trigger('promise:failed', { detail: value });
    promise.isRejected = true;
    promise.rejectedReason = value;
  });
}

function all(promises) {
  var i, results = [];
  var allPromise = new Promise(function() {});
  var remaining = promises.length;

  if (remaining === 0) {
    resolve(allPromise, []);
  }

  var resolver = function(index) {
    return function(value) {
      resolveAll(index, value);
    };
  };

  var resolveAll = function(index, value) {
    results[index] = value;
    if (--remaining === 0) {
      resolve(allPromise, results);
    }
  };

  var rejectAll = function(error) {
    reject(allPromise, error);
  };

  for (i = 0; i < promises.length; i++) {
    if (promises[i] && typeof promises[i].then === 'function') {
      promises[i].then(resolver(i), rejectAll);
    } else {
      resolveAll(i, promises[i]);
    }
  }
  return allPromise;
}

EventTarget.mixin(Promise.prototype);

function configure(name, value) {
  config[name] = value;
}

function defer() {
  var deferred = {};

  var promise = new Promise(function(resolve, reject) {
    deferred.resolve = resolve;
    deferred.reject = reject;
  });

  deferred.promise = promise;
  return deferred;
}

function makeNodeCallbackFor(promise) {
  return function (error, value) {
    if (error) {
      reject(promise, error);
    } else if (arguments.length > 2) {
      resolve(promise, Array.prototype.slice.call(arguments, 1));
    } else {
      resolve(promise, value);
    }
  };
}

function denodeify(nodeFunc) {
  return function()  {
    var nodeArgs = Array.prototype.slice.call(arguments);
    var promise = new Promise(function() {});

    all(nodeArgs).then(function(nodeArgs) {
      nodeArgs.push(makeNodeCallbackFor(promise));

      try {
        nodeFunc.apply(this, nodeArgs);
      } catch(e) {
        reject(promise, e);
      }
    });

    return promise;
  };
}

export { Promise, all, defer, denodeify, configure };
