import { EventTarget } from "./events";

var config = {
  instrument: false
};

EventTarget.mixin(config);

function configure(name, value) {
  if (name === 'onerror') {
    // handle for legacy users that expect the actual
    // error to be passed to their function added via
    // `RSVP.configure('onerror', someFunctionHere);`
    config.on('error', value);
  } else {
    config[name] = value;
  }
}

export { config, configure };
