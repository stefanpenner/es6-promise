import { config } from './config';
import { now } from './utils';

function instrument(eventName, promise, child) {
  // instrumentation should not disrupt normal usage.
  try {
    config.trigger(eventName, {
      guid: promise._guidKey + promise._id,
      eventName: eventName,
      detail: promise._detail,
      childGuid: child && promise._guidKey + child._id,
      label: promise._label,
      timeStamp: now()
    });
  } catch(error) {
    setTimeout(function(){
      throw error;
    }, 0);
  }
}

export { instrument };
