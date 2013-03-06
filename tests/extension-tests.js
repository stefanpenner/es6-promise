/*global RSVP, describe, specify, assert */
describe("RSVP extensions", function() {
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

  describe("RSVP.all", function() {
    specify('it should exist', function() {
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
  });
});
