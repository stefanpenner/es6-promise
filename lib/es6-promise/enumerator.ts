import {
  isArray,
  isMaybeThenable
} from './utils';

import Thenable from './thenable';

import {
  noop,
  reject,
  fulfill,
  resolve,
  subscribe,
  getThen,
  handleMaybeThenable,
} from './-internal';
import { STATE } from './state';

import Promise, {
  _then as originalThen,
  _resolve as originalResolve
} from './promise';
import { makePromise, PROMISE_ID } from './-internal';

function validationError() {
  return new Error('Array Methods must be provided an Array');
}

export default class Enumerator<T> {
  private _instanceConstructor: any; // TODO: this is the constructor of type Promise
  private _input: any = undefined;
  private _result: any = undefined;
  private _state: any = STATE.PENDING;
  private _remaining: number = 0;

  promise: Promise<T []>;
  length: number = 0;

  constructor(Constructor: typeof Promise, input: (T | Thenable<T>) []) {
    this._instanceConstructor = Constructor;
    this.promise = new Constructor(noop);

    if (!this.promise[PROMISE_ID]) {
      makePromise(this.promise);
    }

    if (isArray(input)) {
      this._input     = input;
      this.length     = input.length;
      this._remaining = input.length;

      this._result = new Array(this.length);

      if (this.length === 0) {
        fulfill(this.promise, this._result);
      } else {
        this.length = this.length || 0;
        this._enumerate();
        if (this._remaining === 0) {
          fulfill(this.promise, this._result);
        }
      }
    } else {
      reject(this.promise, validationError());
    }
  }

  _enumerate() {
    let { length, _input } = this;

    for (let i = 0; this._state === STATE.PENDING && i < length; i++) {
      this._eachEntry(_input[i], i);
    }
  }

  _eachEntry(entry, i) {
    let c = this._instanceConstructor;

    if (c.resolve === originalResolve) {
      let then = getThen(entry);

      if (then === originalThen &&
          entry._state !== STATE.PENDING) {
        this._settledAt(entry._state, i, entry._result);
      } else if (typeof then !== 'function') {
        this._remaining--;
        this._result[i] = entry;
      } else if (c === Promise) {
        let promise = new c(noop);
        handleMaybeThenable(promise, entry, then);
        this._willSettleAt(promise, i);
      } else {
        this._willSettleAt(new c(resolve => resolve(entry)), i);
      }
    } else {
      this._willSettleAt(c.resolve(entry), i);
    }
  }

  _settledAt(state: STATE, i, value: T) {
    let { promise } = this;

    if (promise._state === STATE.PENDING) {
      this._remaining--;

      if (state === STATE.REJECTED) {
        reject(promise, value);
      } else {
        this._result[i] = value;
      }
    }

    if (this._remaining === 0) {
      fulfill(promise, this._result);
    }
  }

  _willSettleAt(promise: Promise<T>, i) {
    let enumerator = this;

    subscribe(promise, undefined, value => enumerator._settledAt(STATE.FULFILLED, i, value),
              reason => enumerator._settledAt(STATE.REJECTED, i, reason));
  }
}
