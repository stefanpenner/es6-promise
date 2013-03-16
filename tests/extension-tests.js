/*global RSVP, describe, specify, it, assert */
describe("RSVP extensions", function() {
  describe("Promise constructor", function() {
    it('should exist and have length 1', function() {
      assert(RSVP.Promise);
      assert.equal(RSVP.Promise.length, 1);
    });

    it('should fulfill if `resolve` is called with a value', function(done) {
      var promise = new RSVP.Promise(function(resolve) { resolve('value'); });

      promise.then(function(value) {
        assert.equal(value, 'value');
        done();
      });
    });

    it('should reject if `reject` is called with a reason', function(done) {
      var promise = new RSVP.Promise(function(resolve, reject) { reject('reason'); });

      promise.then(function() {
        assert(false);
        done();
      }, function(reason) {
        assert.equal(reason, 'reason');
        done();
      });
    });

    it('should be a constructor', function() {
      var promise = new RSVP.Promise(function() {});

      assert.equal(Object.getPrototypeOf(promise), RSVP.Promise.prototype, '[[Prototype]] equals Promise.prototype');
      assert.equal(promise.constructor, RSVP.Promise, 'constructor property of instances is set correctly');
      assert.equal(RSVP.Promise.prototype.constructor, RSVP.Promise, 'constructor property of prototype is set correctly');
    });

    it('should work without `new`', function(done) {
      var promise = RSVP.Promise(function(resolve) { resolve('value'); });

      promise.then(function(value) {
        assert.equal(value, 'value');
        done();
      });
    });

    it('should throw a `TypeError` if not given a function', function() {
      assert.throws(function () {
        var promise = new RSVP.Promise();
      }, TypeError);

      assert.throws(function () {
        var promise = new RSVP.Promise({});
      }, TypeError);

      assert.throws(function () {
        var promise = new RSVP.Promise('boo!');
      }, TypeError);
    });

    describe('assimilation', function() {
      it('should assimilate if `resolve` is called with a fulfilled promise', function(done) {
        var originalPromise = new RSVP.Promise(function(resolve) { resolve('original value'); });
        var promise = new RSVP.Promise(function(resolve) { resolve(originalPromise); });

        promise.then(function(value) {
          assert.equal(value, 'original value');
          done();
        });
      });

      it('should assimilate if `resolve` is called with a rejected promise', function(done) {
        var originalPromise = new RSVP.Promise(function(resolve, reject) { reject('original reason'); });
        var promise = new RSVP.Promise(function(resolve) { resolve(originalPromise); });

        promise.then(function() {
          assert(false);
          done();
        }, function(reason) {
          assert.equal(reason, 'original reason');
          done();
        });
      });

      it('should assimilate if `resolve` is called with a fulfilled thenable', function(done) {
        var originalThenable = {
          then: function (onFulfilled) {
            setTimeout(function() { onFulfilled('original value'); }, 0);
          }
        };
        var promise = new RSVP.Promise(function(resolve) { resolve(originalThenable); });

        promise.then(function(value) {
          assert.equal(value, 'original value');
          done();
        });
      });

      it('should assimilate if `resolve` is called with a rejected thenable', function(done) {
        var originalThenable = {
          then: function (onFulfilled, onRejected) {
            setTimeout(function() { onRejected('original reason'); }, 0);
          }
        };
        var promise = new RSVP.Promise(function(resolve) { resolve(originalThenable); });

        promise.then(function() {
          assert(false);
          done();
        }, function(reason) {
          assert.equal(reason, 'original reason');
          done();
        });
      });

      it('should assimilate two levels deep, for fulfillment', function(done) {
        var originalPromise = new RSVP.Promise(function(resolve) { resolve('original value'); });
        var nextPromise = new RSVP.Promise(function(resolve) { resolve(originalPromise); });
        var promise = new RSVP.Promise(function(resolve) { resolve(nextPromise); });

        promise.then(function(value) {
          assert.equal(value, 'original value');
          done();
        });
      });

      it('should assimilate two levels deep, for rejection', function(done) {
        var originalPromise = new RSVP.Promise(function(resolve, reject) { reject('original reason'); });
        var nextPromise = new RSVP.Promise(function(resolve) { resolve(originalPromise); });
        var promise = new RSVP.Promise(function(resolve) { resolve(nextPromise); });

        promise.then(function() {
          assert(false);
          done();
        }, function(reason) {
          assert.equal(reason, 'original reason');
          done();
        });
      });

      it('should assimilate three levels deep, mixing thenables and promises (fulfilled case)', function(done) {
        var originalPromise = new RSVP.Promise(function(resolve) { resolve('original value'); });
        var intermediateThenable = {
          then: function (onFulfilled) {
            setTimeout(function() { onFulfilled(originalPromise); }, 0);
          }
        };
        var promise = new RSVP.Promise(function(resolve) { resolve(intermediateThenable); });

        promise.then(function(value) {
          assert.equal(value, 'original value');
          done();
        });
      });

      it('should assimilate three levels deep, mixing thenables and promises (rejected case)', function(done) {
        var originalPromise = new RSVP.Promise(function(resolve, reject) { reject('original reason'); });
        var intermediateThenable = {
          then: function (onFulfilled) {
            setTimeout(function() { onFulfilled(originalPromise); }, 0);
          }
        };
        var promise = new RSVP.Promise(function(resolve) { resolve(intermediateThenable); });

        promise.then(function() {
          assert(false);
          done();
        }, function(reason) {
          assert.equal(reason, 'original reason');
          done();
        });
      });
    });
  });

  describe("RSVP.defer", function() {
    specify("It should return a resolver and promise together", function(done) {
      var deferred = RSVP.defer(), value = {};

      // resolve first to confirm that the semantics are async
      deferred.resolve(value);

      deferred.promise.then(function(passedValue) {
        assert(passedValue === value);
        done();
      });
    });

    specify("The provided resolver should support rejection", function(done) {
      var deferred = RSVP.defer(), reason = {};

      // resolve first to confirm that the semantics are async
      deferred.reject(reason);

      deferred.promise.then(null, function(passedReason) {
        assert(passedReason === reason);
        done();
      });
    });
  });

  describe("RSVP.denodeify", function() {
    specify('it should exist', function() {
      assert(RSVP.denodeify);
    });

    specify('calls node function with any arguments passed', function(done) {
      var args = null;

      function nodeFunc(arg1, arg2, arg3, cb) {
        args = [arg1, arg2, arg3];
        cb();
      }

      var denodeifiedFunc = RSVP.denodeify(nodeFunc);

      denodeifiedFunc(1, 2, 3).then(function() {
        assert.deepEqual(args, [1, 2, 3]);
        done();
      });
    });

    specify('waits for promise/thenable arguments to settle before passing them to the node function', function(done) {
      var args = null;

      function nodeFunc(arg1, arg2, arg3, cb) {
        args = [arg1, arg2, arg3];
        cb();
      }

      var denodeifiedFunc = RSVP.denodeify(nodeFunc);

      var promise = new RSVP.Promise(function(resolve) { resolve(1); });
      var thenable = { then: function (onFulfilled) { onFulfilled(2); } };
      var nonPromise = 3;
      denodeifiedFunc(promise, thenable, nonPromise).then(function() {
        assert.deepEqual(args, [1, 2, 3]);
        done();
      });
    });

    specify('fulfilled with value if node function calls back with a single argument', function(done) {
      function nodeFunc(cb) {
        cb(null, 'nodeFuncResult');
      }

      var denodeifiedFunc = RSVP.denodeify(nodeFunc);

      denodeifiedFunc().then(function(value) {
        assert.equal(value, 'nodeFuncResult');
        done();
      });
    });

    specify('fulfilled with array if node function calls back with multiple arguments', function(done) {
      function nodeFunc(cb) {
        cb(null, 1, 2, 3);
      }

      var denodeifiedFunc = RSVP.denodeify(nodeFunc);

      denodeifiedFunc().then(function(value) {
        assert.deepEqual(value, [1, 2, 3]);
        done();
      });
    });

    specify('rejected if node function calls back with error', function(done) {
      function nodeFunc(cb) {
        cb('bad!');
      }

      var denodeifiedFunc = RSVP.denodeify(nodeFunc);

      denodeifiedFunc().then(function() {
        assert(false);
        done();
      }, function(reason) {
        assert.equal(reason, 'bad!');
        done();
      });
    });

    specify('rejected if node function throws an exception synchronously', function(done) {
      function nodeFunc(cb) {
        throw 'bad!';
      }

      var denodeifiedFunc = RSVP.denodeify(nodeFunc);

      denodeifiedFunc().then(function() {
        assert(false);
        done();
      }, function(reason) {
        assert.equal(reason, 'bad!');
        done();
      });
    });

    specify('integration test showing how awesome this can be', function(done) {
      function readFile(fileName, cb) {
        setTimeout(function() {
          cb(null, 'contents of ' + fileName);
        }, 0);
      }

      var writtenTo = null;
      function writeFile(fileName, text, cb) {
        setTimeout(function () {
          writtenTo = [fileName, text];
          cb();
        }, 0);
      }

      var denodeifiedReadFile = RSVP.denodeify(readFile);
      var denodeifiedWriteFile = RSVP.denodeify(writeFile);

      denodeifiedWriteFile('dest.txt', denodeifiedReadFile('src.txt')).then(function () {
        assert.deepEqual(writtenTo, ['dest.txt', 'contents of src.txt']);
        done();
      });
    });
  });

  describe("RSVP.all", function() {
    it('should exist', function() {
      assert(RSVP.all);
    });

    specify('fulfilled only after all of the other promises are fulfilled', function(done) {
      var firstResolved, secondResolved, firstResolver, secondResolver;

      var first = new RSVP.Promise(function(resolve) {
        firstResolver = resolve;
      });
      first.then(function() {
        firstResolved = true;
      });

      var second = new RSVP.Promise(function(resolve) {
        secondResolver = resolve;
      });
      second.then(function() {
        secondResolved = true;
      });

      setTimeout(function() {
        firstResolver(true);
      }, 0);

      setTimeout(function() {
        secondResolver(true);
      }, 0);

      RSVP.all([first, second]).then(function() {
        assert(firstResolved);
        assert(secondResolved);
        done();
      });
    });

    specify('rejected as soon as a promise is rejected', function(done) {
      var firstResolver, secondResolver;

      var first = new RSVP.Promise(function(resolve, reject) {
        firstResolver = { resolve: resolve, reject: reject };
      });

      var second = new RSVP.Promise(function(resolve, reject) {
        secondResolver = { resolve: resolve, reject: reject };
      });

      setTimeout(function() {
        firstResolver.reject({});
      }, 0);

      setTimeout(function() {
        secondResolver.resolve(true);
      }, 5000);

      RSVP.all([first, second]).then(function() {
        assert(false);
      }, function() {
        assert(first.isRejected);
        assert(!second.isResolved);
        done();
      });
    });

    specify('passes the resolved values of each promise to the callback in the correct order', function(done) {
      var firstResolver, secondResolver, thirdResolver;

      var first = new RSVP.Promise(function(resolve, reject) {
        firstResolver = { resolve: resolve, reject: reject };
      });

      var second = new RSVP.Promise(function(resolve, reject) {
        secondResolver = { resolve: resolve, reject: reject };
      });

      var third = new RSVP.Promise(function(resolve, reject) {
        thirdResolver = { resolve: resolve, reject: reject };
      });

      thirdResolver.resolve(3);
      firstResolver.resolve(1);
      secondResolver.resolve(2);

      RSVP.all([first, second, third]).then(function(results) {
        assert(results.length === 3);
        assert(results[0] === 1);
        assert(results[1] === 2);
        assert(results[2] === 3);
        done();
      });
    });

    specify('resolves an empty array passed to RSVP.all()', function(done) {
      RSVP.all([]).then(function(results) {
        assert(results.length === 0);
        done();
      });
    });

    specify('works with a mix of promises and thenables and non-promises', function(done) {
      var promise = new RSVP.Promise(function(resolve) { resolve(1); });
      var syncThenable = { then: function (onFulfilled) { onFulfilled(2); } };
      var asyncThenable = { then: function (onFulfilled) { setTimeout(function() { onFulfilled(3); }, 0); } };
      var nonPromise = 4;

      RSVP.all([promise, syncThenable, asyncThenable, nonPromise]).then(function(results) {
        assert.deepEqual(results, [1, 2, 3, 4]);
        done();
      });
    });
  });
});
