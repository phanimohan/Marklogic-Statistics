'use strict';

try {
  // This is a workaround to allow Lambda have a concept of environment.
  process.env.NODE_ENV = require('./config/local').env; // eslint-disable-line global-require,import/no-unresolved
}
catch (e) {
  // Do nothing.
}

const config = require('config');
const SlackApp = require('./app/slackApp');

/**
 * The collection of lambda functions.
 *
 * @type {{}}
 */
const functions = {};

/**
 * Generated function for the operation.
 *
 * @param {Object} event
 *   The event object.
 * @param {Object} context
 *   Additional data.
 * @param {function} cb
 *   Finish callback.
 *
 * @returns {void}
 */

functions.logMLStatistics = (event, context, cb) => {
  process.env.channelName = config.get('channelName');
  const requestedDateTime = new Date();
  new SlackApp().mlStatistics(requestedDateTime)
                .then(() => {
                  const message = `Logged the Stats to
                                   ${config.get('channelName')} Channel`;
                  cb(null, {message});
                })
                .catch((err) => {
                  const message = `Error occurred in Logging the Stats to
                                   ${config.get('channelName')} channel:`;
                  cb(err, {message});
                });
};

module.exports = functions;
