import { EventTarget } from "rsvp/events";
import { Promise } from "rsvp/promise";
import { denodeify } from "rsvp/node";
import { all } from "rsvp/all";
import { defer } from "rsvp/defer";
import { config } from "rsvp/config";

function configure(name, value) {
  config[name] = value;
}

export { Promise, EventTarget, all, defer, denodeify, configure };