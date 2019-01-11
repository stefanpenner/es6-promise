'use strict';

module.exports = {
  test_page: "test/index.html",
  parallel: 5,
  frameworks: "mocha",
  launchers: {
    Mocha: {
      "command": `./node_modules/.bin/mocha ${process.env.EMBER_CLI_TEST_OUTPUT}/test/browserify.js -R tap`,
      "protocol": "tap"
    }
  },
  launch_in_ci:  [
    "Phantomjs",
    "Mocha"
  ],
  launch_in_dev: [
    "Phantomjs",
    "Mocha"
  ],
};
