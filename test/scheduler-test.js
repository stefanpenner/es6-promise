/*global describe, it, assert */

var g = typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : this;
var Promise = g.adapter.Promise;
var assert = require('assert');

describe('scheduler', function() {
  afterEach(function() {
      // make sure the es6-promise scheduler is restored after each test
      Promise._setScheduler(void 0);
  });

  describe('Promise._setScheduler', function() {
    it('should allow overriding the default scheduling mechanism', function(done) {
      // Wrapped in a setTimeout() to make sure that the microtask queue is empty
      // Otherwise we would have len > 2 and the overriden scheduling mechanism would not
      // be used.
      // This is required because the test library uses Promise.
      setTimeout(function() {
        var microtasks = [];
        var resolvedWith = null;

        Promise._setScheduler(function(fn) {
          microtasks.push(fn);
        });

        Promise.resolve('value').then(function(v) {
          resolvedWith = v;
        });

        assert.equal(resolvedWith, null);
        assert.equal(microtasks.length, 1);

        while (microtasks.length) {
          microtasks.shift()();
        }

        assert.equal(resolvedWith, 'value');

        // restore the original scheduler
        Promise._setScheduler(void 0);
        done();
      });
    });
  });

  describe('Promise._asap', function() {
    it('should allow enqueuing microtasks', function(done) {
      Promise._asap(function(arg) {
        assert.equal(arg, 'arg');
        done();
      }, 'arg');
    });
  });

  describe('Promise._setAsap', function() {
    it('should allow overriding asap', function(done) {
      var called = false;

      Promise._setAsap(function(fn, arg) {
        called = true;
        // call the original implementation
        Promise._asap(fn, arg);
        // restore the original implementation
        Promise._setAsap(Promise._asap);
      });

      Promise.resolve('value').then(function(v) {
        resolvedWith = v;
        assert.equal(v, 'value');
        assert.equal(called, true);
        done();
      });
    });
  });
});
