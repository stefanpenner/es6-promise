import { async } from "rsvp/async";
import { EventTarget } from "rsvp/events";

var config = {};
config.async = async;

var noop = function() {};

var Promise = function(resolver) {
  var promise = this;

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

  if (resolver) {
    resolver(resolvePromise, rejectPromise);
  }
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
  then: function(done, fail) {
    var thenPromise = new Promise();

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
  var allPromise = new Promise();
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

export { Promise, all, defer, configure };
