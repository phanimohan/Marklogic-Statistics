'use strict';

const SlackConfig = require('./slackConfig');
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
    * @return {Promise}
    *  Returns the promise object.
    */
  mlStatistics() {
    return slackInst.getCPUMemoryStats()
                    .then(cpuMemUsage => slackInst.getMLAppServerStats(appServers, cpuMemUsage))
                    .then(() => slackInst.postMLStats())
                    .catch(e => Promise.reject(`Error in ML statistics Code ${e}`));
  }
}

module.exports = SlackApp;
