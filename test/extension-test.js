/*global describe, specify, it, assert */

if (typeof Object.getPrototypeOf !== "function") {
  Object.getPrototypeOf = "".__proto__ === String.prototype
    ? function (object) {
      return object.__proto__;
    }
    : function (object) {
      // May break if the constructor has been tampered with
      return object.constructor.prototype;
    };
}

function keysOf(object) {
  var results = [];

  for (var key in object) {
    if (object.hasOwnProperty(key)) {
      results.push(key);
    }
  }

  return results;
}

var g = typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : this;
var Promise = g.adapter.Promise;
var assert = require('assert');

function objectEquals(obj1, obj2) {
  for (var i in obj1) {
    if (obj1.hasOwnProperty(i)) {
      if (!obj2.hasOwnProperty(i)) return false;
      if (obj1[i] != obj2[i]) return false;
    }
  }
  for (var i in obj2) {
    if (obj2.hasOwnProperty(i)) {
      if (!obj1.hasOwnProperty(i)) return false;
      if (obj1[i] != obj2[i]) return false;
    }
  }
  return true;
}

describe("extensions", function() {
  describe("Promise constructor", function() {
    it('should exist and have length 1', function() {
      assert(Promise);
      assert.equal(Promise.length, 1);
    });

    it('should fulfill if `resolve` is called with a value', function(done) {
      var promise = new Promise(function(resolve) { resolve('value'); });

      promise.then(function(value) {
        assert.equal(value, 'value');
        done();
      });
    });

    it('should reject if `reject` is called with a reason', function(done) {
      var promise = new Promise(function(resolve, reject) { reject('reason'); });

      promise.then(function() {
        assert(false);
        done();
      }, function(reason) {
        assert.equal(reason, 'reason');
        done();
      });
    });

    it('should be a constructor', function() {
      var promise = new Promise(function() {});

      assert.equal(Object.getPrototypeOf(promise), Promise.prototype, '[[Prototype]] equals Promise.prototype');
      assert.equal(promise.constructor, Promise, 'constructor property of instances is set correctly');
      assert.equal(Promise.prototype.constructor, Promise, 'constructor property of prototype is set correctly');
    });

    it('should NOT work without `new`', function() {
      assert.throws(function(){
        Promise(function(resolve) { resolve('value'); });
      }, TypeError)
    });

    it('should throw a `TypeError` if not given a function', function() {
      assert.throws(function () {
        new Promise();
      }, TypeError);

      assert.throws(function () {
        new Promise({});
      }, TypeError);

      assert.throws(function () {
        new Promise('boo!');
      }, TypeError);
    });

    it('should reject on resolver exception', function(done) {
     new Promise(function() {
        throw 'error';
      }).then(null, function(e) {
        assert.equal(e, 'error');
        done();
      });
    });

    it('should not resolve multiple times', function(done) {
      var resolver, rejector, fulfilled = 0, rejected = 0;
      var thenable = {
        then: function(resolve, reject) {
          resolver = resolve;
          rejector = reject;
        }
      };

      var promise = new Promise(function(resolve) {
        resolve(1);
      });

      promise.then(function(value){
        return thenable;
      }).then(function(value){
        fulfilled++;
      }, function(reason) {
        rejected++;
      });

      setTimeout(function() {
        resolver(1);
        resolver(1);
        rejector(1);
        rejector(1);

        setTimeout(function() {
          assert.equal(fulfilled, 1);
          assert.equal(rejected, 0);
          done();
        }, 20);
      }, 20);

    });

    describe('assimilation', function() {
      it('should assimilate if `resolve` is called with a fulfilled promise', function(done) {
        var originalPromise = new Promise(function(resolve) { resolve('original value'); });
        var promise = new Promise(function(resolve) { resolve(originalPromise); });

        promise.then(function(value) {
          assert.equal(value, 'original value');
          done();
        });
      });

      it('should assimilate if `resolve` is called with a rejected promise', function(done) {
        var originalPromise = new Promise(function(resolve, reject) { reject('original reason'); });
        var promise = new Promise(function(resolve) { resolve(originalPromise); });

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
        var promise = new Promise(function(resolve) { resolve(originalThenable); });

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
        var promise = new Promise(function(resolve) { resolve(originalThenable); });

        promise.then(function() {
          assert(false);
          done();
        }, function(reason) {
          assert.equal(reason, 'original reason');
          done();
        });
      });


      it('should assimilate two levels deep, for fulfillment of self fulfilling promises', function(done) {
        var originalPromise, promise;
        originalPromise = new Promise(function(resolve) {
          setTimeout(function() {
            resolve(originalPromise);
          }, 0)
        });

        promise = new Promise(function(resolve) {
          setTimeout(function() {
            resolve(originalPromise);
          }, 0);
        });

        promise.then(function(value) {
          assert(false);
          done();
        })['catch'](function(reason) {
          assert.equal(reason.message, "You cannot resolve a promise with itself");
          assert(reason instanceof TypeError);
          done();
        });
      });

      it('should assimilate two levels deep, for fulfillment', function(done) {
        var originalPromise = new Promise(function(resolve) { resolve('original value'); });
        var nextPromise = new Promise(function(resolve) { resolve(originalPromise); });
        var promise = new Promise(function(resolve) { resolve(nextPromise); });

        promise.then(function(value) {
          assert.equal(value, 'original value');
          done();
        });
      });

      it('should assimilate two levels deep, for rejection', function(done) {
        var originalPromise = new Promise(function(resolve, reject) { reject('original reason'); });
        var nextPromise = new Promise(function(resolve) { resolve(originalPromise); });
        var promise = new Promise(function(resolve) { resolve(nextPromise); });

        promise.then(function() {
          assert(false);
          done();
        }, function(reason) {
          assert.equal(reason, 'original reason');
          done();
        });
      });

      it('should assimilate three levels deep, mixing thenables and promises (fulfilled case)', function(done) {
        var originalPromise = new Promise(function(resolve) { resolve('original value'); });
        var intermediateThenable = {
          then: function (onFulfilled) {
            setTimeout(function() { onFulfilled(originalPromise); }, 0);
          }
        };
        var promise = new Promise(function(resolve) { resolve(intermediateThenable); });

        promise.then(function(value) {
          assert.equal(value, 'original value');
          done();
        });
      });

      it('should assimilate three levels deep, mixing thenables and promises (rejected case)', function(done) {
        var originalPromise = new Promise(function(resolve, reject) { reject('original reason'); });
        var intermediateThenable = {
          then: function (onFulfilled) {
            setTimeout(function() { onFulfilled(originalPromise); }, 0);
          }
        };
        var promise = new Promise(function(resolve) { resolve(intermediateThenable); });

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

  describe("Promise.all", function() {
    testAll(function(){
      return Promise.all.apply(Promise, arguments);
    });
  });

  function testAll(all) {
    it('should exist', function() {
      assert(all);
    });

    it('throws when not passed an array', function(done) {
      var nothing = assertRejection(all());
      var string  = assertRejection(all(''));
      var object  = assertRejection(all({}));

      Promise.all([
        nothing,
        string,
        object
      ]).then(function(){ done(); });
    });

    specify('fulfilled only after all of the other promises are fulfilled', function(done) {
      var firstResolved, secondResolved, firstResolver, secondResolver;

      var first = new Promise(function(resolve) {
        firstResolver = resolve;
      });
      first.then(function() {
        firstResolved = true;
      });

      var second = new Promise(function(resolve) {
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

      all([first, second]).then(function() {
        assert(firstResolved);
        assert(secondResolved);
        done();
      });
    });

    specify('rejected as soon as a promise is rejected', function(done) {
      var firstResolver, secondResolver;

      var first = new Promise(function(resolve, reject) {
        firstResolver = { resolve: resolve, reject: reject };
      });

      var second = new Promise(function(resolve, reject) {
        secondResolver = { resolve: resolve, reject: reject };
      });

      setTimeout(function() {
        firstResolver.reject({});
      }, 0);

      var firstWasRejected, secondCompleted;

      first['catch'](function(){
        firstWasRejected = true;
      });

      second.then(function(){
        secondCompleted = true;
      }, function() {
        secondCompleted = true;
      });

      all([first, second]).then(function() {
        assert(false);
      }, function() {
        assert(firstWasRejected);
        assert(!secondCompleted);
        done();
      });
    });

    specify('passes the resolved values of each promise to the callback in the correct order', function(done) {
      var firstResolver, secondResolver, thirdResolver;

      var first = new Promise(function(resolve, reject) {
        firstResolver = { resolve: resolve, reject: reject };
      });

      var second = new Promise(function(resolve, reject) {
        secondResolver = { resolve: resolve, reject: reject };
      });

      var third = new Promise(function(resolve, reject) {
        thirdResolver = { resolve: resolve, reject: reject };
      });

      thirdResolver.resolve(3);
      firstResolver.resolve(1);
      secondResolver.resolve(2);

      all([first, second, third]).then(function(results) {
        assert(results.length === 3);
        assert(results[0] === 1);
        assert(results[1] === 2);
        assert(results[2] === 3);
        done();
      });
    });

    specify('resolves an empty array passed to all()', function(done) {
      all([]).then(function(results) {
        assert(results.length === 0);
        done();
      });
    });

    specify('works with null', function(done) {
      all([null]).then(function(results) {
        assert.equal(results[0], null);
        done();
      });
    });

    specify('works with a mix of promises and thenables and non-promises', function(done) {
      var promise = new Promise(function(resolve) { resolve(1); });
      var syncThenable = { then: function (onFulfilled) { onFulfilled(2); } };
      var asyncThenable = { then: function (onFulfilled) { setTimeout(function() { onFulfilled(3); }, 0); } };
      var nonPromise = 4;

      all([promise, syncThenable, asyncThenable, nonPromise]).then(function(results) {
        assert(objectEquals(results, [1, 2, 3, 4]));
        done();
      })['catch'](done);
    });
  }

  describe("reject", function(){
    specify("it should exist", function(){
      assert(Promise.reject);
    });

    describe('it rejects', function(){
      var reason = 'the reason',
      promise = Promise.reject(reason);

      promise.then(function(){
        assert(false, 'should not fulfill');
      }, function(actualReason){
        assert.equal(reason, actualReason);
      });
    });
  });

  function assertRejection(promise) {
    return promise.then(function(){
      assert(false, 'expected rejection, but got fulfillment');
    }, function(reason){
      assert(reason instanceof Error);
    });
  }

  describe('race', function() {
    it("should exist", function() {
      assert(Promise.race);
    });

    it("throws when not passed an array", function(done) {
      var nothing = assertRejection(Promise.race());
      var string  = assertRejection(Promise.race(''));
      var object  = assertRejection(Promise.race({}));

      Promise.all([
        nothing,
        string,
        object
      ]).then(function(){ done(); });
    });

    specify('fulfilled after one of the other promises are fulfilled', function(done) {
      var firstResolved, secondResolved, firstResolver, secondResolver;

      var first = new Promise(function(resolve) {
        firstResolver = resolve;
      });
      first.then(function() {
        firstResolved = true;
      });

      var second = new Promise(function(resolve) {
        secondResolver = resolve;
      });
      second.then(function() {
        secondResolved = true;
      });

      setTimeout(function() {
        firstResolver(true);
      }, 100);

      setTimeout(function() {
        secondResolver(true);
      }, 0);

      Promise.race([first, second]).then(function() {
        assert(secondResolved);
        assert.equal(firstResolved, undefined);
        done();
      });
    });

    specify('the race begins on nextTurn and prioritized by array entry', function(done) {
      var firstResolver, secondResolver, nonPromise = 5;

      var first = new Promise(function(resolve, reject) {
        resolve(true);
      });

      var second = new Promise(function(resolve, reject) {
        resolve(false);
      });

      Promise.race([first, second, nonPromise]).then(function(value) {
        assert.equal(value, true);
        done();
      });
    });

    specify('rejected as soon as a promise is rejected', function(done) {
      var firstResolver, secondResolver;

      var first = new Promise(function(resolve, reject) {
        firstResolver = { resolve: resolve, reject: reject };
      });

      var second = new Promise(function(resolve, reject) {
        secondResolver = { resolve: resolve, reject: reject };
      });

      setTimeout(function() {
        firstResolver.reject({});
      }, 0);

      var firstWasRejected, secondCompleted;

      first['catch'](function(){
        firstWasRejected = true;
      });

      second.then(function(){
        secondCompleted = true;
      }, function() {
        secondCompleted = true;
      });

      Promise.race([first, second]).then(function() {
        assert(false);
      }, function() {
        assert(firstWasRejected);
        assert(!secondCompleted);
        done();
      });
    });

    specify('resolves an empty array to forever pending Promise', function(done) {
      var foreverPendingPromise = Promise.race([]),
          wasSettled            = false;

      foreverPendingPromise.then(function() {
        wasSettled = true;
      }, function() {
        wasSettled = true;
      });

      setTimeout(function() {
        assert(!wasSettled);
        done();
      }, 100);
    });

    specify('works with a mix of promises and thenables', function(done) {
      var promise = new Promise(function(resolve) { setTimeout(function() { resolve(1); }, 10); }),
          syncThenable = { then: function (onFulfilled) { onFulfilled(2); } };

      Promise.race([promise, syncThenable]).then(function(result) {
        assert(result, 2);
        done();
      });
    });

    specify('works with a mix of thenables and non-promises', function (done) {
      var asyncThenable = { then: function (onFulfilled) { setTimeout(function() { onFulfilled(3); }, 0); } },
          nonPromise = 4;

      Promise.race([asyncThenable, nonPromise]).then(function(result) {
        assert(result, 4);
        done();
      });
    });
  });

  describe("resolve", function(){
    specify("it should exist", function(){
      assert(Promise.resolve);
    });

    describe("1. If x is a promise, adopt its state ", function(){
      specify("1.1 If x is pending, promise must remain pending until x is fulfilled or rejected.", function(done){
        var expectedValue, resolver, thenable, wrapped;

        expectedValue = 'the value';
        thenable = {
          then: function(resolve, reject){
            resolver = resolve;
          }
        };

        wrapped = Promise.resolve(thenable);

        wrapped.then(function(value){
          assert(value === expectedValue);
          done();
        });

        setTimeout(function(){
          resolver(expectedValue);
        }, 10);
      });

      specify("1.2 If/when x is fulfilled, fulfill promise with the same value.", function(done){
        var expectedValue, thenable, wrapped;

        expectedValue = 'the value';
        thenable = {
          then: function(resolve, reject){
            resolve(expectedValue);
          }
        };

        wrapped = Promise.resolve(thenable);

        wrapped.then(function(value){
          assert(value === expectedValue);
          done();
        })
      });

      specify("1.3 If/when x is rejected, reject promise with the same reason.", function(done){
        var expectedError, thenable, wrapped;

        expectedError =  new Error();
        thenable = {
          then: function(resolve, reject){
            reject(expectedError);
          }
        };

        wrapped = Promise.resolve(thenable);

        wrapped.then(null, function(error){
          assert(error === expectedError);
          done();
        });
      });
    });

    describe("2. Otherwise, if x is an object or function,", function(){
      specify("2.1 Let then x.then", function(done){
        var accessCount, resolver, wrapped, thenable;

        accessCount = 0;
        thenable = { };

        // we likely don't need to test this, if the browser doesn't support it
        if (typeof Object.defineProperty !== "function") { done(); return; }

        Object.defineProperty(thenable, 'then', {
          get: function(){
            accessCount++;

            if (accessCount > 1) {
              throw new Error();
            }

            return function(){ };
          }
        });

        assert(accessCount === 0);

        wrapped = Promise.resolve(thenable);

        assert(accessCount === 1);

        done();
      });

      specify("2.2 If retrieving the property x.then results in a thrown exception e, reject promise with e as the reason.", function(done){
        var wrapped, thenable, expectedError;

        expectedError = new Error();
        thenable = { };

        // we likely don't need to test this, if the browser doesn't support it
        if (typeof Object.defineProperty !== "function") { done(); return; }

        Object.defineProperty(thenable, 'then', {
          get: function(){
            throw expectedError;
          }
        });

        wrapped = Promise.resolve(thenable);

        wrapped.then(null, function(error){
          assert(error === expectedError, 'incorrect exception was thrown');
          done();
        });
      });

      describe('2.3. If then is a function, call it with x as this, first argument resolvePromise, and second argument rejectPromise, where', function(){
        specify('2.3.1 If/when resolvePromise is called with a value y, run Resolve(promise, y)', function(done){
          var expectedSuccess, resolver, rejector, thenable, wrapped, calledThis;

          thenable = {
            then: function(resolve, reject){
              calledThis = this;
              resolver = resolve;
              rejector = reject;
            }
          };

          expectedSuccess = 'success';
          wrapped = Promise.resolve(thenable);

          wrapped.then(function(success){
            assert(calledThis === thenable, 'this must be the thenable');
            assert(success === expectedSuccess, 'rejected promise with x');
            done();
          });

          setTimeout(function() {
            resolver(expectedSuccess);
          }, 20);
        });

        specify('2.3.2 If/when rejectPromise is called with a reason r, reject promise with r.', function(done){
          var expectedError, resolver, rejector, thenable, wrapped, calledThis;

          thenable = {
            then: function(resolve, reject){
              calledThis = this;
              resolver = resolve;
              rejector = reject;
            }
          };

          expectedError = new Error();

          wrapped = Promise.resolve(thenable);

          wrapped.then(null, function(error){
            assert(error === expectedError, 'rejected promise with x');
            done();
          });

          setTimeout(function() {
            rejector(expectedError);
          }, 20);
        });

        specify("2.3.3 If both resolvePromise and rejectPromise are called, or multiple calls to the same argument are made, the first call takes precedence, and any further calls are ignored", function(done){
          var expectedError, expectedSuccess, resolver, rejector, thenable, wrapped, calledThis,
          calledRejected, calledResolved;

          calledRejected = 0;
          calledResolved = 0;

          thenable = {
            then: function(resolve, reject){
              calledThis = this;
              resolver = resolve;
              rejector = reject;
            }
          };

          expectedError = new Error();

          wrapped = Promise.resolve(thenable);

          wrapped.then(function(){
            calledResolved++;
          }, function(error){
            calledRejected++;
            assert(calledResolved === 0, 'never resolved');
            assert(calledRejected === 1, 'rejected only once');
            assert(error === expectedError, 'rejected promise with x');
          });

          setTimeout(function() {
            rejector(expectedError);
            rejector(expectedError);

            rejector('foo');

            resolver('bar');
            resolver('baz');
          }, 20);

          setTimeout(function(){
            assert(calledRejected === 1, 'only rejected once');
            assert(calledResolved === 0, 'never resolved');
            done();
          }, 50);
        });

        describe("2.3.4 If calling then throws an exception e", function(){
          specify("2.3.4.1 If resolvePromise or rejectPromise have been called, ignore it.", function(done){
            var expectedSuccess, resolver, rejector, thenable, wrapped, calledThis,
            calledRejected, calledResolved;

            expectedSuccess = 'success';

            thenable = {
              then: function(resolve, reject){
                resolve(expectedSuccess);
                throw expectedError;
              }
            };

            wrapped = Promise.resolve(thenable);

            wrapped.then(function(success){
              assert(success === expectedSuccess, 'resolved not errored');
              done();
            });
          });

          specify("2.3.4.2 Otherwise, reject promise with e as the reason.", function(done) {
            var expectedError, resolver, rejector, thenable, wrapped, calledThis, callCount;

            expectedError = new Error();
            callCount = 0;

            thenable = { then: function() { throw expectedError; } };

            wrapped = Promise.resolve(thenable);

            wrapped.then(null, function(error){
              callCount++;
              assert(expectedError === error, 'expected the correct error to be rejected');
              done();
            });

            assert(callCount === 0, 'expected async, was sync');
          });
        });
      });

      specify("2.4 If then is not a function, fulfill promise with x", function(done){
        var expectedError, resolver, rejector, thenable, wrapped, calledThis, callCount;

        thenable = { then: 3 };
        callCount = 0;
        wrapped = Promise.resolve(thenable);

        wrapped.then(function(success){
          callCount++;
          assert(thenable === success, 'fulfilled promise with x');
          done();
        });

        assert(callCount === 0, 'expected async, was sync');
      });
    });

    describe("3. If x is not an object or function, ", function(){
      specify("fulfill promise with x.", function(done){
        var thenable, callCount, wrapped;

        thenable = null;
        callCount = 0;
        wrapped = Promise.resolve(thenable);

        wrapped.then(function(success){
          callCount++;
          assert(success === thenable, 'fulfilled promise with x');
          done();
        }, function(a){
          assert(false, 'should not also reject');
        });

        assert(callCount === 0, 'expected async, was sync');
      });
    });
  });

  if (typeof Worker !== 'undefined') {
    describe('web worker', function () {
      it('should work', function (done) {
        this.timeout(2000);
        var worker = new Worker('worker.js');
        worker.addEventListener('error', function(reason) {
          done(new Error("Test failed:" + reason));
        });
        worker.addEventListener('message', function (e) {
          worker.terminate();
          assert.equal(e.data, 'pong');
          done();
        });
        worker.postMessage('ping');
      });
    });
  }
});

// thanks to @wizardwerdna for the test case -> https://github.com/tildeio/rsvp.js/issues/66
// Only run these tests in node (phantomjs cannot handle them)
if (typeof module !== 'undefined' && module.exports) {

  describe("using reduce to sum integers using promises", function(){
    it("should build the promise pipeline without error", function(){
      var array, iters, pZero, i;

      array = [];
      iters = 1000;

      for (i=1; i<=iters; i++) {
        array.push(i);
      }

      pZero = Promise.resolve(0);

      array.reduce(function(promise, nextVal) {
        return promise.then(function(currentVal) {
          return Promise.resolve(currentVal + nextVal);
        });
      }, pZero);
    });

    it("should get correct answer without blowing the nextTick stack", function(done){
      var pZero, array, iters, result, i;

      pZero = Promise.resolve(0);

      array = [];
      iters = 1000;

      for (i=1; i<=iters; i++) {
        array.push(i);
      }

      result = array.reduce(function(promise, nextVal) {
        return promise.then(function(currentVal) {
          return Promise.resolve(currentVal + nextVal);
        });
      }, pZero);

      result.then(function(value){
        assert.equal(value, (iters*(iters+1)/2));
        done();
      });
    });
  });
}

// Kudos to @Octane at https://github.com/getify/native-promise-only/issues/5 for this, and @getify for pinging me.
describe("Thenables should not be able to run code during assimilation", function () {
    specify("resolving to a thenable", function () {
        var thenCalled = false;
        var thenable = {
            then: function () {
                thenCalled = true;
            }
        };

        Promise.resolve(thenable);
        assert.strictEqual(thenCalled, false);
    });

    specify("resolving to an evil promise", function () {
        var thenCalled = false;
        var evilPromise = Promise.resolve();
        evilPromise.then = function () {
            thenCalled = true;
        };

        Promise.resolve(evilPromise);
        assert.strictEqual(thenCalled, false);
    });
});
