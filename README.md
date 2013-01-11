# RSVP.js

RSVP.js provides simple tools for organizing asynchronous code.

Specifically, it is a tiny implementation of Promises/A and a
mixin for turning objects into event targets.

It works in node and the browser. You can get the browser build in
`browser/rsvp.js` and `browser/rsvp.min.js`.

## Promises

`RSVP.Promise` is an implementation of
[Promises/A](http://wiki.commonjs.org/wiki/Promises/A) that passes the
[promises test suite](https://github.com/domenic/promise-tests) written
by Domenic Denicola.

It passes both the primary suite, which tests explicit compliance with
the Promises/A spec, and the extension tests, which test compliance with
commonly accepted practices around promises in JavaScript.

It delivers all promises asynchronously, even if the value is already
available, to help you write consistent code that doesn't change if the
underlying data provider changes from synchronous to asynchronous.

It is compatible with [TaskJS](http://taskjs.org/), a library by Dave
Herman of Mozilla that uses ES6 generators to allow you to write
synchronous code with promises. It currently works in Firefox, and will
work in any browser that adds support for ES6 generators. See the
section below on TaskJS for more information.

### Basic Usage

```javascript
var promise = new Promise();

promise.then(function(value) {
  // success
}, function(value) {
  // failure
});

// later...

promise.resolve(value) // triggers first callback
promise.reject(error) // triggers second callback
```

Once a promise has been resolved or rejected, it cannot be resolved or
rejected again.

Here is an example of a simple XHR2 wrapper written using RSVP.js:

```javascript
var getJSON = function(url) {
  var promise = new RSVP.Promise();

  var client = new XMLHttpRequest();
  client.open("GET", url);
  client.onreadystatechange = handler;
  client.responseType = "json";
  client.setRequestHeader("Accept", "application/json");
  client.send();

  function handler() {
    if (this.readyState === this.DONE) {
      if (this.status === 200) { promise.resolve(this.response); }
      else { promise.reject(this); }
    }
  };

  return promise;
};

getJSON("/posts.json").then(function(json) {
  // continue
}, function(error) {
  // handle errors
});
```

### Chaining

One of the really awesome features of Promises/A promises are that they
can be chained together. In other words, the return value of the first
resolve handler will be passed to the second resolve handler.

If you return a regular value, it will be passed, as is, to the next
handler.

```javascript
getJSON("/posts.json").then(function(json) {
  return json.post;
}).then(function(post) {
  // proceed
});;
```

The really awesome part comes when you return a promise from the first
handler:

```javascript
getJSON("/post/1.json").then(function(post) {
  // save off post
  return getJSON(post.commentURL);
}).then(function(comments) {
  // proceed with access to posts and comments
});;
```

This allows you to flatten out nested callbacks, and is the main feature
of promises that prevents "rightward drift" in programs with a lot of
asynchronous code.

Errors also propagate:

```javascript
getJSON("/posts.json").then(function(posts) {

}).then(null, function(error) {
  // even though no error callback was passed to the
  // first `.then`, the error propagates
});
```

You can use this to emulate `try/catch` logic in synchronous code.
Simply chain as many resolve callbacks as a you want, and add a failure
handler at the end to catch errors.

```javascript
getJSON("/post/1.json").then(function(post) {
  return getJSON(post.commentURL);
}).then(function(comments) {
  // proceed with access to posts and comments
}).then(null, function(error) {
  // handle errors in either of the two requests
});
```

## Arrays of promises

Sometimes you might want to work with many promises at once. If you
pass an array of promises to the `all()` method it will return a new
promise that will be fulfilled when all of the promises in the array
have been fulfilled; or rejected immediately if any promise in the array
is rejected.

```javascript
var postIds = [2, 3, 5, 7, 11, 13];
var promises = [];

for(var i = 0; i < postIds.length; i++) {
	promises.push(getJSON("/post/" + postIds[i] + ".json"));
}

RSVP.all(promises).then(function(posts) {
	// posts contains an array of results for the given promises
});
```

## TaskJS

The [TaskJS](http://taskjs.org/) library makes it possible to take
promises-oriented code and make it synchronous using ES6 generators.

Let's review an earlier example:

```javascript
getJSON("/post/1.json").then(function(post) {
  return getJSON(post.commentURL);
}).then(function(comments) {
  // proceed with access to posts and comments
}).then(null, function(error) {
  // handle errors in either of the two requests
});
```

Without any changes to the implementation of `getJSON`, you could write
the following code with TaskJS:

```javascript
spawn(function *() {
  try {
    var post = yield getJSON("/post/1.json");
    var comments = yield getJSON(post.commentURL);
  } catch(error) {
    // handle errors
  }
});
```

In the above example, `function *` is new syntax in ES6 for
[generators](http://wiki.ecmascript.org/doku.php?id=harmony:generators).
Inside a generator, `yield` pauses the generator, returning control to
the function that invoked the generator. In this case, the invoker is a
special function that understands the semantics of Promises/A, and will
automatically resume the generator as soon as the promise is resolved.

The cool thing here is the same promises that work with current
JavaScript using `.then` will work seamlessly with TaskJS once a browser
has implemented it!

## Event Target

RSVP also provides a mixin that you can use to convert any object into
an event target. The promises implementation uses `RSVP.EventTarget`, so
`RSVP` exposes it for your own use.

### Basic Usage

The basic usage of `RSVP.EventTarget` is to mix it into an object, then
use `on` and `trigger` to register listeners and trigger them.

```javascript
var object = {};

RSVP.EventTarget.mixin(object);

object.on("finished", function(event) {
  // handle event
});

object.trigger("finished", { detail: value });
```

### Prototypes

You can mix `RSVP.EventTarget` into a prototype and it will work as
expected.

```javascript
var Person = function() {};
RSVP.EventTarget.mixin(Person.prototype);

var yehuda = new Person();
var tom = new Person();

yehuda.on("poke", function(event) {
  console.log("Yehuda says OW");
});

tom.on("poke", function(event) {
  console.log("Tom says OW");
});

yehuda.trigger("poke");
tom.trigger("poke");
```

The example will work as expected. If you mix `RSVP.EventTarget` into a
constructor's prototype, each instance of that constructor will get its
own callbacks.
