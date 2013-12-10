import { Promise } from "./promise/promise";
import { cast } from "./promise/cast";
import { all } from "./promise/all";
import { race } from "./promise/race";
import { config, configure } from "./promise/config";
import { resolve } from "./promise/resolve";
import { reject } from "./promise/reject";
import { asap } from "./promise/asap";

config.async = asap; // default async is asap;

Promise.all = all;
Promise.cast = cast;
Promise.race = race;
Promise.resolve = resolve;
Promise.reject = reject;

export { Promise };
