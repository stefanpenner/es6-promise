import { EventTarget } from "./rsvp/events";
import { Promise } from "./rsvp/promise";
import { denodeify } from "./rsvp/node";
import { all } from "./rsvp/all";
import { race } from "./rsvp/race";
import { hash } from "./rsvp/hash";
import { rethrow } from "./rsvp/rethrow";
import { defer } from "./rsvp/defer";
import { config, configure } from "./rsvp/config";
import { resolve } from "./rsvp/resolve";
import { reject } from "./rsvp/reject";
import { asap } from "./rsvp/asap";

config.async = asap; // default async is asap;

function async(callback, arg) {
  config.async(callback, arg);
}

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

export { Promise, EventTarget, all, race, hash, rethrow, defer, denodeify, configure, trigger, on, off, resolve, reject, async };
