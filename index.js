'use strict';

const SlackApp = require('./app/slackApp');

exports.handler = function (event, context) {
  console.log('Marklogic Statistics has triggered::: =>');

  console.log('Stats Input Info:', JSON.stringify(event, null, 2));

  const trigger = event.trigger;

  if (trigger) {
    new SlackApp().mlStatistics();
  }
  else {
    console.log('Please enable the trigger to post stats to Slack Channel::: =>');
  }
};
