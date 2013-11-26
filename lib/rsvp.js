import { EventTarget } from "./rsvp/events";
import { Promise } from "./rsvp/promise";
import { denodeify } from "./rsvp/node";
import { all } from "./rsvp/all";
import { hash } from "./rsvp/hash";
import { rethrow } from "./rsvp/rethrow";
import { defer } from "./rsvp/defer";
import { config, configure } from "./rsvp/config";
import { resolve } from "./rsvp/resolve";
import { reject } from "./rsvp/reject";
import { async, asyncDefault } from "./rsvp/async";

function on() {
  config.on.apply(config, arguments);
}

function off() {
  config.off.apply(config, arguments);
}

function trigger() {
  config.trigger.apply(config, arguments);
}

Promise.on = on;
Promise.off = off;
Promise.trigger = trigger;

export { Promise, EventTarget, all, hash, rethrow, defer, denodeify, configure, resolve, reject, async, asyncDefault, on, off };
