'use strict';

const SlackConfig = require('./slackConfig');
const postMLStats = require('./postStats');
const config = require('config');

const slackInst = new SlackConfig();
const appServers = config.get('appServers');

/**
 * The Slack application class to instantiate the statistics information
 * @class
 */
class SlackApp {
   /**
    * Function to instantiate all the marklogic statistics information.
    *
    * @param {date}
    * Requested dateTime value to fetch the statistics information.
    *
    * @return {Promise}
    *  Returns the promise object.
    */
  mlStatistics(requestDateTime) {
    return slackInst.getCPUMemoryStats(requestDateTime)
                    .then(() => slackInst.getMLAppServerStats(appServers, requestDateTime))
                    .then(() => postMLStats(slackInst.getFinalStats()))
                    .catch(e => Promise.reject(`Error in ML statistics Code ${e}`));
  }
}

module.exports = SlackApp;
