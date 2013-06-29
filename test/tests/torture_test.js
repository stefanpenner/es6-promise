// thanks to @wizardwerdna for the test case -> https://github.com/tildeio/rsvp.js/issues/66
describe("using reduce to sum integers using promises", function(){
  var resolve = RSVP.resolve;

  it("should build the promise pipeline without error", function(){
    var array, iters, pZero, i;

    array = [];
    iters = 1000;

    for (i=1; i<=iters; i++) {
      array.push(i);
    }

    pZero = resolve(0);

    array.reduce(function(promise, nextVal) {
      return promise.then(function(currentVal) {
        return resolve(currentVal + nextVal);
      });
    }, pZero);
  });

  it("should get correct answer without blowing the nextTick stack", function(done){
    var pZero, array, iters, result, i;

    pZero = resolve(0);

    array = [];
    iters = 1000;

    for (i=1; i<=iters; i++) {
      array.push(i);
    }

    result = array.reduce(function(promise, nextVal) {
      return promise.then(function(currentVal) {
        return resolve(currentVal + nextVal);
      });
    }, pZero);

    result.then(function(value){
      assert.equal(value, (iters*(iters+1)/2));
      done();
    });
  });
});
