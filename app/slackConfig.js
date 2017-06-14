'use strict';

const config = require('config');
const configuration = require('./configuration');
const moment = require('moment-timezone');
const _ = require('lodash');

/**
 * The Slack config application class will fetch all marklogic statistics
 * information.
 * @class
 */
class SlackConfig extends configuration {

  /**
   * Constructs the instance to create the slackConfig object.
   * @constructor
   *
   */
  constructor() {
    super();
    this.stats = {};
    this.groupId = config.get('groupId');
    this.period = config.get('period');
  }

  /**
   * Function to format all Hosts in the cluster to a json object.
   *
   * @param {array} hosts
   *   The group of hosts in a cluster.
   *
   * @return {Object}
   *  Returns the json object.
   */
  getHostArray(hosts) {
    const result = {};
    hosts.forEach((host) => {
      result[host.idref] = host.nameref;
    });
    return result;
  }

  /**
   * Function to format the text value we push to slack channel.
   *
   * @return {string}
   *  Returns the string.
   */
  getFinalStats() {
    const textValue =
    `*Data for Marklogic*: ${this.stats.displayTime} PST \n` +
    `*CPU - User*: ${this.stats.cpuUserUsage} %\n` +
    `*Memory - RSS*: ${this.stats.memUsage} GB\n` +
    `*AppServer (nbc-park) request Rate*: ${this.stats['nbc-park']} requests/sec \n` +
    `*AppServer (nbc-snl-node) request Rate*: ${this.stats['nbc-snl-node']} requests/sec \n`;

    return textValue;
  }

  /**
   * Function to fetch the appservers config information from ML database.
   *
   * @param {array} appServers
   *   The list of appserver names.
   * @param {Object} cpuMemUsage
   *   The spu and memory utilization information.
   *
   *
   * @return {Promise}
   *  Returns the promise object.
   */
  getMLAppServerStats(appServers) {
    return Promise.all(appServers.map((appServer) => {
      return this.get(`manage/LATEST/servers/${appServer}?view=status&group-id=${this.groupId}&format=${config.format}`)
                 .then((serverObj) => {
                   const serverPath = `server-status.status-properties.total-request-rate.value`;
                   this.stats[appServer] = _.get(serverObj, serverPath, 0);
                 })
                 .catch(e => Promise.reject(`Error in fetching the appserver statistics
                                             for ${appServer} with ${e}`));
    }));
  }

  /**
   * Function to fetch the CPU and Memory statistics information.
   *
   * @param {date} requestedDateTime
   * The dateTime value to fetch the ML statistics.
   *
   * @return {Promise}
   *  Returns the promise object.
   */
  getCPUMemoryStats(requestedDateTime) {
    requestedDateTime.setTime(requestedDateTime.getTime() - 60000);

    return this.get(`manage/LATEST/hosts?view=metrics&format=${config.format}&period=${this.period}&start=${requestedDateTime.toISOString()}`)
               .then((res) => {
                 const metricsPath = 'host-metrics-list.metrics-relations.host-metrics-list.metrics';

                 const currentPSTDateTime = moment(new Date()).tz('America/Los_Angeles').locale('en').format('YYYY-MM-DD hh:mm A');
                 this.stats.displayTime = currentPSTDateTime;

                 // Fetching the CPU and Memory Statistics
                 return _.get(res, metricsPath, [])
                         .reduce((idleCpu, metric) => {
                           if (metric['total-cpu-stat-idle']) {
                        // Setting the cpu stat value to stats instance variable
                             this.stats.cpuUserUsage =
                             (100 - metric['total-cpu-stat-idle'].summary.data.entry[0].value).toFixed(2);
                           }
                           if (metric['memory-process-rss']) {
                       // Setting the memory stat value to stats instance variable
                             this.stats.memUsage =
                             (metric['memory-process-rss'].summary.data.entry[0].value / 1000).toFixed(2);
                           }
                           return idleCpu;
                         }, 0);
               })
              .catch(e => Promise.reject(`Error in fetching the cpu and memory statistics: ${e}`));
  }
}

module.exports = SlackConfig;
