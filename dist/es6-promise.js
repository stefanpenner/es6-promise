/*!
 * @overview es6-promise - a tiny implementation of Promises/A+.
 * @copyright Copyright (c) 2014 Yehuda Katz, Tom Dale, Stefan Penner and contributors (Conversion to ES6 API by Jake Archibald)
 * @license   Licensed under MIT license
 *            See https://raw.githubusercontent.com/stefanpenner/es6-promise/master/LICENSE
 * @version   4.0.3+2d3cd847
 */

(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global.ES6Promise = factory());
}(this, (function () { 'use strict';

function objectOrFunction(x) {
    return typeof x === 'function' || (typeof x === 'object' && x !== null);
}
function isFunction(x) {
    return typeof x === 'function';
}
var _isArray;
if (!Array.isArray) {
    _isArray = function (x) { return Object.prototype.toString.call(x) === '[object Array]'; };
}
else {
    _isArray = Array.isArray;
}
var isArray = _isArray;

var len = 0;
var vertxNext;
var customSchedulerFn;
var asap = function asap(callback, arg) {
    queue[len] = callback;
    queue[len + 1] = arg;
    len += 2;
    if (len === 2) {
        // If len is 2, that means that we need to schedule an async flush.
        // If additional callbacks are queued before the queue is flushed, they
        // will be processed by this flush that we are scheduling.
        if (customSchedulerFn) {
            customSchedulerFn(flush);
        }
        else {
            scheduleFlush();
        }
    }
};
function setScheduler(scheduleFn) {
    customSchedulerFn = scheduleFn;
}
function setAsap(asapFn) {
    asap = asapFn;
}
var browserWindow = (typeof window !== 'undefined') ? window : undefined;
var browserGlobal = (browserWindow || {});
var BrowserMutationObserver = browserGlobal.MutationObserver || browserGlobal.WebKitMutationObserver;
var isNode = typeof self === 'undefined' && typeof process !== 'undefined' && {}.toString.call(process) === '[object process]';
// test for web worker but not in IE10
var isWorker = typeof Uint8ClampedArray !== 'undefined' &&
    typeof importScripts !== 'undefined' &&
    typeof MessageChannel !== 'undefined';
// node
function useNextTick() {
    // node version 0.10.x displays a deprecation warning when nextTick is used recursively
    // see https://github.com/cujojs/when/issues/410 for details
    return function () { return process.nextTick(flush); };
}
// vertx
function useVertxTimer() {
    return function () {
        vertxNext(flush);
    };
}
function useMutationObserver() {
    var iterations = 0;
    var observer = new BrowserMutationObserver(flush);
    var node = document.createTextNode('');
    observer.observe(node, { characterData: true });
    return function () {
        node.data = '' + (iterations = ++iterations % 2);
    };
}
// web worker
function useMessageChannel() {
    var channel = new MessageChannel();
    channel.port1.onmessage = flush;
    return function () { return channel.port2.postMessage(0); };
}
function useSetTimeout() {
    // Store setTimeout reference so es6-promise will be unaffected by
    // other code modifying setTimeout (like sinon.useFakeTimers())
    var globalSetTimeout = setTimeout;
    return function () { return globalSetTimeout(flush, 1); };
}
var queue = new Array(1000);
function flush() {
    for (var i = 0; i < len; i += 2) {
        var callback = queue[i];
        var arg = queue[i + 1];
        callback(arg);
        queue[i] = undefined;
        queue[i + 1] = undefined;
    }
    len = 0;
}
function attemptVertx() {
    try {
        var r = require;
        var vertx = r('vertx');
        vertxNext = vertx.runOnLoop || vertx.runOnContext;
        return useVertxTimer();
    }
    catch (e) {
        return useSetTimeout();
    }
}
var scheduleFlush;
// Decide what async method to use to triggering processing of queued callbacks:
if (isNode) {
    scheduleFlush = useNextTick();
}
else if (BrowserMutationObserver) {
    scheduleFlush = useMutationObserver();
}
else if (isWorker) {
    scheduleFlush = useMessageChannel();
}
else if (browserWindow === undefined && typeof require === 'function') {
    scheduleFlush = attemptVertx();
}
else {
    scheduleFlush = useSetTimeout();
}

var PROMISE_ID = Math.random().toString(36).substring(16);
function noop() { }
var ErrorObject = (function () {
    function ErrorObject() {
        this.error = null;
    }
    return ErrorObject;
}());
var GET_THEN_ERROR = new ErrorObject();
function selfFulfillment() {
    return new TypeError("You cannot resolve a promise with itself");
}
function cannotReturnOwn() {
    return new TypeError('A promises callback cannot return that same promise.');
}
function getThen(promise) {
    try {
        return promise.then;
    }
    catch (error) {
        GET_THEN_ERROR.error = error;
        return GET_THEN_ERROR;
    }
}
function tryThen(then, value, fulfillmentHandler, rejectionHandler) {
    try {
        then.call(value, fulfillmentHandler, rejectionHandler);
    }
    catch (e) {
        return e;
    }
}
function handleForeignThenable(promise, thenable, then) {
    asap(function (promise) {
        var sealed = false;
        var error = tryThen(then, thenable, function (value) {
            if (sealed) {
                return;
            }
            sealed = true;
            if (thenable !== value) {
                resolve(promise, value);
            }
            else {
                fulfill(promise, value);
            }
        }, function (reason) {
            if (sealed) {
                return;
            }
            sealed = true;
            reject(promise, reason);
        });
        if (!sealed && error) {
            sealed = true;
            reject(promise, error);
        }
    }, promise);
}
function handleOwnThenable(promise, thenable) {
    if (thenable._state === 1 /* FULFILLED */) {
        fulfill(promise, thenable._result);
    }
    else if (thenable._state === 2 /* REJECTED */) {
        reject(promise, thenable._result);
    }
    else {
        subscribe(thenable, undefined, function (value) { return resolve(promise, value); }, function (reason) { return reject(promise, reason); });
    }
}
function handleMaybeThenable(promise, maybeThenable, then) {
    if (maybeThenable.constructor === promise.constructor &&
        then === originalThen &&
        maybeThenable.constructor.resolve === originalResolve) {
        handleOwnThenable(promise, maybeThenable);
    }
    else {
        if (then === GET_THEN_ERROR) {
            reject(promise, GET_THEN_ERROR.error);
        }
        else if (then === undefined) {
            fulfill(promise, maybeThenable);
        }
        else if (isFunction(then)) {
            handleForeignThenable(promise, maybeThenable, then);
        }
        else {
            fulfill(promise, maybeThenable);
        }
    }
}
function resolve(promise, value) {
    if (promise === value) {
        reject(promise, selfFulfillment());
    }
    else if (objectOrFunction(value)) {
        handleMaybeThenable(promise, value, getThen(value));
    }
    else {
        fulfill(promise, value);
    }
}
function publishRejection(promise) {
    if (promise._onerror) {
        promise._onerror(promise._result);
    }
    publish(promise);
}
function fulfill(promise, value) {
    if (promise._state !== 0 /* PENDING */) {
        return;
    }
    promise._result = value;
    promise._state = 1 /* FULFILLED */;
    if (promise._subscribers.length !== 0) {
        asap(publish, promise);
    }
}
function reject(promise, reason) {
    if (promise._state !== 0 /* PENDING */) {
        return;
    }
    promise._state = 2 /* REJECTED */;
    promise._result = reason;
    asap(publishRejection, promise);
}
function subscribe(parent, child, onFulfillment, onRejection) {
    var _subscribers = parent._subscribers;
    var length = _subscribers.length;
    parent._onerror = null;
    _subscribers[length] = child;
    _subscribers[length + 1 /* FULFILLED */] = onFulfillment;
    _subscribers[length + 2 /* REJECTED */] = onRejection;
    if (length === 0 && parent._state) {
        asap(publish, parent);
    }
}
function publish(promise) {
    var subscribers = promise._subscribers;
    var settled = promise._state;
    if (subscribers.length === 0) {
        return;
    }
    var child, callback, detail = promise._result;
    for (var i = 0; i < subscribers.length; i += 3) {
        child = subscribers[i];
        callback = subscribers[i + settled];
        if (child) {
            invokeCallback(settled, child, callback, detail);
        }
        else {
            callback(detail);
        }
    }
    promise._subscribers.length = 0;
}
var TRY_CATCH_ERROR = new ErrorObject();
function tryCatch(callback, detail) {
    try {
        return callback(detail);
    }
    catch (e) {
        TRY_CATCH_ERROR.error = e;
        return TRY_CATCH_ERROR;
    }
}
function invokeCallback(settled, promise, callback, detail) {
    var hasCallback = isFunction(callback), value, error, succeeded, failed;
    if (hasCallback) {
        value = tryCatch(callback, detail);
        if (value === TRY_CATCH_ERROR) {
            failed = true;
            error = value.error;
            value = null;
        }
        else {
            succeeded = true;
        }
        if (promise === value) {
            reject(promise, cannotReturnOwn());
            return;
        }
    }
    else {
        value = detail;
        succeeded = true;
    }
    if (promise._state !== 0 /* PENDING */) {
    }
    else if (hasCallback && succeeded) {
        resolve(promise, value);
    }
    else if (failed) {
        reject(promise, error);
    }
    else if (settled === 1 /* FULFILLED */) {
        fulfill(promise, value);
    }
    else if (settled === 2 /* REJECTED */) {
        reject(promise, value);
    }
}
function initializePromise(promise, resolver) {
    try {
        resolver(function (value) { return resolve(promise, value); }, function (reason) { return reject(promise, reason); });
    }
    catch (e) {
        reject(promise, e);
    }
}
var _id = 0;
function nextId() {
    return _id++;
}
function makePromise(promise) {
    promise[PROMISE_ID] = nextId();
    promise._state = undefined;
    promise._result = undefined;
    promise._subscribers = [];
}

function validationError() {
    return new Error('Array Methods must be provided an Array');
}
var Enumerator = (function () {
    function Enumerator(Constructor, input) {
        this._input = undefined;
        this._result = undefined;
        this._state = 0 /* PENDING */;
        this._remaining = 0;
        this.length = 0;
        this._instanceConstructor = Constructor;
        this.promise = new Constructor(noop);
        if (!this.promise[PROMISE_ID]) {
            makePromise(this.promise);
        }
        if (isArray(input)) {
            this._input = input;
            this.length = input.length;
            this._remaining = input.length;
            this._result = new Array(this.length);
            if (this.length === 0) {
                fulfill(this.promise, this._result);
            }
            else {
                this.length = this.length || 0;
                this._enumerate();
                if (this._remaining === 0) {
                    fulfill(this.promise, this._result);
                }
            }
        }
        else {
            reject(this.promise, validationError());
        }
    }
    Enumerator.prototype._enumerate = function () {
        var _a = this, length = _a.length, _input = _a._input;
        for (var i = 0; this._state === 0 /* PENDING */ && i < length; i++) {
            this._eachEntry(_input[i], i);
        }
    };
    Enumerator.prototype._eachEntry = function (entry, i) {
        var c = this._instanceConstructor;
        if (c.resolve === originalResolve) {
            var then = getThen(entry);
            if (then === originalThen &&
                entry._state !== 0 /* PENDING */) {
                this._settledAt(entry._state, i, entry._result);
            }
            else if (typeof then !== 'function') {
                this._remaining--;
                this._result[i] = entry;
            }
            else if (c === Promise) {
                var promise = new c(noop);
                handleMaybeThenable(promise, entry, then);
                this._willSettleAt(promise, i);
            }
            else {
                this._willSettleAt(new c(function (resolve) { return resolve(entry); }), i);
            }
        }
        else {
            this._willSettleAt(c.resolve(entry), i);
        }
    };
    Enumerator.prototype._settledAt = function (state, i, value) {
        var promise = this.promise;
        if (promise._state === 0 /* PENDING */) {
            this._remaining--;
            if (state === 2 /* REJECTED */) {
                reject(promise, value);
            }
            else {
                this._result[i] = value;
            }
        }
        if (this._remaining === 0) {
            fulfill(promise, this._result);
        }
    };
    Enumerator.prototype._willSettleAt = function (promise, i) {
        var enumerator = this;
        subscribe(promise, undefined, function (value) { return enumerator._settledAt(1 /* FULFILLED */, i, value); }, function (reason) { return enumerator._settledAt(2 /* REJECTED */, i, reason); });
    };
    return Enumerator;
}());

function needsResolver() {
    throw new TypeError('You must pass a resolver function as the first argument to the promise constructor');
}
function needsNew() {
    throw new TypeError("Failed to construct 'Promise': Please use the 'new' operator, this object constructor cannot be called as a function.");
}
/**
  Promise objects represent the eventual result of an asynchronous operation. The
  primary way of interacting with a promise is through its `then` method, which
  registers callbacks to receive either a promise's eventual value or the reason
  why the promise cannot be fulfilled.

  Terminology
  -----------

  - `promise` is an object or function with a `then` method whose behavior conforms to this specification.
  - `thenable` is an object or function that defines a `then` method.
  - `value` is any legal JavaScript value (including undefined, a thenable, or a promise).
  - `exception` is a value that is thrown using the throw statement.
  - `reason` is a value that indicates why a promise was rejected.
  - `settled` the final resting state of a promise, fulfilled or rejected.

  A promise can be in one of three states: pending, fulfilled, or rejected.

  Promises that are fulfilled have a fulfillment value and are in the fulfilled
  state.  Promises that are rejected have a rejection reason and are in the
  rejected state.  A fulfillment value is never a thenable.

  Promises can also be said to *resolve* a value.  If this value is also a
  promise, then the original promise's settled state will match the value's
  settled state.  So a promise that *resolves* a promise that rejects will
  itself reject, and a promise that *resolves* a promise that fulfills will
  itself fulfill.


  Basic Usage:
  ------------

  ```js
  let promise = new Promise(function(resolve, reject) {
    // on success
    resolve(value);

    // on failure
    reject(reason);
  });

  promise.then(function(value) {
    // on fulfillment
  }, function(reason) {
    // on rejection
  });
  ```

  Advanced Usage:
  ---------------

  Promises shine when abstracting away asynchronous interactions such as
  `XMLHttpRequest`s.

  ```js
  function getJSON(url) {
    return new Promise(function(resolve, reject){
      let xhr = new XMLHttpRequest();

      xhr.open('GET', url);
      xhr.onreadystatechange = handler;
      xhr.responseType = 'json';
      xhr.setRequestHeader('Accept', 'application/json');
      xhr.send();

      function handler() {
        if (this.readyState === this.DONE) {
          if (this.status === 200) {
            resolve(this.response);
          } else {
            reject(new Error('getJSON: `' + url + '` failed with status: [' + this.status + ']'));
          }
        }
      };
    });
  }

  getJSON('/posts.json').then(function(json) {
    // on fulfillment
  }, function(reason) {
    // on rejection
  });
  ```

  Unlike callbacks, promises are great composable primitives.

  ```js
  Promise.all([
    getJSON('/posts'),
    getJSON('/comments')
  ]).then(function(values){
    values[0] // => postsJSON
    values[1] // => commentsJSON

    return values;
  });
  ```

  @class Promise
  @param {function} resolver
  Useful for tooling.
  @constructor
*/
var Promise = (function () {
    function Promise(resolver) {
        this._result = undefined;
        this._state = 0 /* PENDING */; // TODO: type this
        this._subscribers = []; // TODO: type this
        this[PROMISE_ID] = nextId();
        if (noop !== resolver) {
            typeof resolver !== 'function' && needsResolver();
            this instanceof Promise ? initializePromise(this, resolver) : needsNew();
        }
    }
    /**
      `Promise.resolve` returns a promise that will become resolved with the
      passed `value`. It is shorthand for the following:
  
      ```javascript
      let promise = new Promise(function(resolve, reject){
        resolve(1);
      });
  
      promise.then(function(value){
        // value === 1
      });
      ```
  
      Instead of writing the above, your code now simply becomes the following:
  
      ```javascript
      let promise = Promise.resolve(1);
  
      promise.then(function(value){
        // value === 1
      });
      ```
  
      @method resolve
      @static
      @param {Any} value value that the returned promise will be resolved with
      Useful for tooling.
      @return {Promise} a promise that will become fulfilled with the given
      `value`
    */
    Promise.resolve = function (value) {
        /*jshint validthis:true */
        var Constructor = this;
        if (value && typeof value === 'object' && value.constructor === Constructor) {
            return value;
        }
        var promise = new Constructor(noop);
        resolve(promise, value);
        return promise;
    };
    /**
      `Promise.reject` returns a promise rejected with the passed `reason`.
      It is shorthand for the following:
  
      ```javascript
      let promise = new Promise(function(resolve, reject){
        reject(new Error('WHOOPS'));
      });
  
      promise.then(function(value){
        // Code here doesn't run because the promise is rejected!
      }, function(reason){
        // reason.message === 'WHOOPS'
      });
      ```
  
      Instead of writing the above, your code now simply becomes the following:
  
      ```javascript
      let promise = Promise.reject(new Error('WHOOPS'));
  
      promise.then(function(value){
        // Code here doesn't run because the promise is rejected!
      }, function(reason){
        // reason.message === 'WHOOPS'
      });
      ```
  
      @method reject
      @static
      @param {Any} reason value that the returned promise will be rejected with.
      Useful for tooling.
      @return {Promise} a promise rejected with the given `reason`.
    */
    Promise.reject = function (reason) {
        /*jshint validthis:true */
        var promise = new this(noop);
        reject(promise, reason);
        return promise;
    };
    /**
      `Promise.all` accepts an array of promises, and returns a new promise which
      is fulfilled with an array of fulfillment values for the passed promises, or
      rejected with the reason of the first passed promise to be rejected. It casts all
      elements of the passed iterable to promises as it runs this algorithm.
  
      Example:
  
      ```javascript
      let promise1 = resolve(1);
      let promise2 = resolve(2);
      let promise3 = resolve(3);
      let promises = [ promise1, promise2, promise3 ];
  
      Promise.all(promises).then(function(array){
        // The array here would be [ 1, 2, 3 ];
      });
      ```
  
      If any of the `promises` given to `all` are rejected, the first promise
      that is rejected will be given as an argument to the returned promises's
      rejection handler. For example:
  
      Example:
  
      ```javascript
      let promise1 = resolve(1);
      let promise2 = reject(new Error("2"));
      let promise3 = reject(new Error("3"));
      let promises = [ promise1, promise2, promise3 ];
  
      Promise.all(promises).then(function(array){
        // Code here never runs because there are rejected promises!
      }, function(error) {
        // error.message === "2"
      });
      ```
  
      @method all
      @static
      @param {Array} entries array of promises
      @param {String} label optional string for labeling the promise.
      Useful for tooling.
      @return {Promise} promise that is fulfilled when all `promises` have been
      fulfilled, or rejected if any of them become rejected.
      @static
    */
    Promise.all = function (entries) {
        return new Enumerator(this, entries).promise;
    };
    /**
      `Promise.race` returns a new promise which is settled in the same way as the
      first passed promise to settle.
  
      Example:
  
      ```javascript
      let promise1 = new Promise(function(resolve, reject){
        setTimeout(function(){
          resolve('promise 1');
        }, 200);
      });
  
      let promise2 = new Promise(function(resolve, reject){
        setTimeout(function(){
          resolve('promise 2');
        }, 100);
      });
  
      Promise.race([promise1, promise2]).then(function(result){
        // result === 'promise 2' because it was resolved before promise1
        // was resolved.
      });
      ```
  
      `Promise.race` is deterministic in that only the state of the first
      settled promise matters. For example, even if other promises given to the
      `promises` array argument are resolved, but the first settled promise has
      become rejected before the other promises became fulfilled, the returned
      promise will become rejected:
  
      ```javascript
      let promise1 = new Promise(function(resolve, reject){
        setTimeout(function(){
          resolve('promise 1');
        }, 200);
      });
  
      let promise2 = new Promise(function(resolve, reject){
        setTimeout(function(){
          reject(new Error('promise 2'));
        }, 100);
      });
  
      Promise.race([promise1, promise2]).then(function(result){
        // Code here never runs
      }, function(reason){
        // reason.message === 'promise 2' because promise 2 became rejected before
        // promise 1 became fulfilled
      });
      ```
  
      An example real-world use case is implementing timeouts:
  
      ```javascript
      Promise.race([ajax('foo.json'), timeout(5000)])
      ```
  
      @method race
      @static
      @param {Array} promises array of promises to observe
      Useful for tooling.
      @return {Promise} a promise which settles in the same way as the first passed
      promise to settle.
    */
    Promise.race = function (entries) {
        var _this = this;
        /*jshint validthis:true */
        var resolver;
        if (!isArray(entries)) {
            resolver = function (_, reject) { return reject(new TypeError('You must pass an array to race.')); };
        }
        else {
            resolver = function (resolve, reject) {
                var length = entries.length;
                for (var i = 0; i < length; i++) {
                    _this.resolve(entries[i]).then(resolve, reject);
                }
            };
        }
        return new this(resolver);
    };
    /**
      `catch` is simply sugar for `then(undefined, onRejection)` which makes it the same
      as the catch block of a try/catch statement.
  
      ```js
      function findAuthor(){
        throw new Error('couldn't find that author');
      }
  
      // synchronous
      try {
        findAuthor();
      } catch(reason) {
        // something went wrong
      }
  
      // async with promises
      findAuthor().catch(function(reason){
        // something went wrong
      });
      ```
  
      @method catch
      @param {Function} onRejection
      Useful for tooling.
      @return {Promise}
    */
    Promise.prototype.catch = function (onRejection) {
        return this.then(void 0, onRejection);
    };
    Promise.prototype.then = function (onFulfillment, onRejection) {
        var parent = this;
        var child = new (this.constructor(noop));
        if (child[PROMISE_ID] === undefined) {
            makePromise(child);
        }
        var _state = parent._state;
        if (_state) {
            var callback_1 = arguments[_state - 1];
            asap(function () { return invokeCallback(_state, child, callback_1, parent._result); }, void 0);
        }
        else {
            subscribe(parent, child, onFulfillment, onRejection);
        }
        return child;
    };
    Promise._setScheduler = setScheduler;
    Promise._setAsap = setAsap;
    Promise._asap = asap;
    return Promise;
}());
var originalThen = Promise.prototype.then;
var originalResolve = Promise.resolve;

function polyfill() {
    var local;
    if (typeof global !== 'undefined') {
        local = global;
    }
    else if (typeof self !== 'undefined') {
        local = self;
    }
    else {
        try {
            local = Function('return this')();
        }
        catch (e) {
            throw new Error('polyfill failed because global object is unavailable in this environment');
        }
    }
    var P = local.Promise;
    if (P) {
        var promiseToString = null;
        try {
            promiseToString = Object.prototype.toString.call(P.resolve());
        }
        catch (e) {
        }
        if (promiseToString === '[object Promise]' && !P.cast) {
            return;
        }
    }
    local.Promise = Promise;
}

Promise.polyfill = polyfill;
Promise.Promise = Promise;

return Promise;

})));
//# sourceMappingURL=es6-promise.map