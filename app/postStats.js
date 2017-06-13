'use strict';

const config = require('config');
const Slack = require('slack-node');

/**
 * Function to POST the Marklogic statistics to Slack Channel.
 *
 * @return {Promise}
 *  Returns the Promise Object.
 */
module.exports = (messageContent) => {
  const slackObj = new Slack();
  slackObj.setWebhook(config.get('webhook'));
  return new Promise((resolve, reject) => {
    slackObj.webhook({
      channel: config.get('channelName'),
      username: config.get('groupName'),
      text: messageContent,
    }, (err, res) => {
      if (err) {
        reject(err);
      }
      else {
        resolve(res);
      }
    });
  });
};
