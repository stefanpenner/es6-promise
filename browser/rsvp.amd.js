define(
  ["rsvp/events","rsvp/promise","rsvp/node","rsvp/all","rsvp/hash","rsvp/defer","rsvp/config","rsvp/resolve","exports"],
  function(__dependency1__, __dependency2__, __dependency3__, __dependency4__, __dependency5__, __dependency6__, __dependency7__, __dependency8__, __exports__) {
    "use strict";
    var EventTarget = __dependency1__.EventTarget;
    var Promise = __dependency2__.Promise;
    var denodeify = __dependency3__.denodeify;
    var all = __dependency4__.all;
    var hash = __dependency5__.hash;
    var defer = __dependency6__.defer;
    var config = __dependency7__.config;
    var resolve = __dependency8__.resolve;

    function configure(name, value) {
      config[name] = value;
    }


    __exports__.Promise = Promise;
    __exports__.EventTarget = EventTarget;
    __exports__.all = all;
    __exports__.hash = hash;
    __exports__.defer = defer;
    __exports__.denodeify = denodeify;
    __exports__.configure = configure;
    __exports__.resolve = resolve;
  });
