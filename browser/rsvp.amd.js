define(
  ["rsvp/events","rsvp/promise","rsvp/node","rsvp/all","rsvp/defer","rsvp/config","exports"],
  function(__dependency1__, __dependency2__, __dependency3__, __dependency4__, __dependency5__, __dependency6__, __exports__) {
    "use strict";
    var EventTarget = __dependency1__.EventTarget;
    var Promise = __dependency2__.Promise;
    var denodeify = __dependency3__.denodeify;
    var all = __dependency4__.all;
    var defer = __dependency5__.defer;
    var config = __dependency6__.config;

    function configure(name, value) {
      config[name] = value;
    }

    __exports__.Promise = Promise;
    __exports__.EventTarget = EventTarget;
    __exports__.all = all;
    __exports__.defer = defer;
    __exports__.denodeify = denodeify;
    __exports__.configure = configure;
  });
