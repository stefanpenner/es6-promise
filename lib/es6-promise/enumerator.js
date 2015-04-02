import {
  isArray,
  isMaybeThenable
} from './utils';

import {
  noop,
  reject,
  fulfill,
  subscribe,
  FULFILLED,
  REJECTED,
  PENDING
} from './-internal';

export function makeSettledResult(state, position, value) {
  return {
    state: (state === FULFILLED) ? 'fulfilled' : 'rejected',
    reason: value
  };
}

function Enumerator(Constructor, input, abortOnReject, label) {
  var self = this;

  self._instanceConstructor = Constructor;
  self.promise = new Constructor(noop, label);
  self._abortOnReject = abortOnReject;

  if (self._validateInput(input)) {
    self._input     = input;
    self.length     = input.length;
    self._remaining = input.length;

    self._init();

    if (self.length === 0) {
      fulfill(self.promise, self._result);
    } else {
      self.length = self.length || 0;
      self._enumerate();
      if (self._remaining === 0) {
        fulfill(self.promise, self._result);
      }
    }
  } else {
    reject(self.promise, self._validationError());
  }
}

Enumerator.prototype._validateInput = function(input) {
  return isArray(input);
};

Enumerator.prototype._validationError = function() {
  return new Error('Array Methods must be provided an Array');
};

Enumerator.prototype._init = function() {
  this._result = new Array(this.length);
};

export default Enumerator;

Enumerator.prototype._enumerate = function() {
  var length  = this.length,
      promise = this.promise,
      input   = this._input;

  for (var i = 0; promise._state === PENDING && i < length; i++) {
    this._eachEntry(input[i], i);
  }
};

Enumerator.prototype._eachEntry = function(entry, i) {
  var self = this,
      c = this._instanceConstructor;

  if (isMaybeThenable(entry)) {
    if (entry.constructor === c && entry._state !== PENDING) {
      entry._onerror = null;
      self._settledAt(entry._state, i, entry._result);
    } else {
      self._willSettleAt(c.resolve(entry), i);
    }
  } else {
    self._remaining--;
    self._result[i] = self._makeResult(FULFILLED, i, entry);
  }
};

Enumerator.prototype._settledAt = function(state, i, value) {
  var self = this,
      promise = self.promise;

  if (promise._state === PENDING) {
    self._remaining--;

    if (self._abortOnReject && state === REJECTED) {
      reject(promise, value);
    } else {
      self._result[i] = self._makeResult(state, i, value);
    }
  }

  if (self._remaining === 0) {
    fulfill(promise, self._result);
  }
};

Enumerator.prototype._makeResult = function(state, i, value) {
  return value;
};

Enumerator.prototype._willSettleAt = function(promise, i) {
  var enumerator = this;

  subscribe(promise, undefined, function(value) {
    enumerator._settledAt(FULFILLED, i, value);
  }, function(reason) {
    enumerator._settledAt(REJECTED, i, reason);
  });
};
