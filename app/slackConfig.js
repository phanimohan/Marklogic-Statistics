'use strict';

const Slack = require('slack-node');
const config = require('config');
const configuration = require('./configuration');
const moment = require('moment-timezone');

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
    this.slack = new Slack();
    this.slack.setWebhook(config.get('webhook'));
    this.groupId = config.get('groupId');
    this.appServerRequestRate = {};
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
  getfinalStats() {
    const appReqRate = this.appServerRequestRate;
    const textValue =
    `NBCU SUPPORT L1: \n` +
    `Data for Marklogic(PST) @ ${appReqRate.usage.pstTime} \n` +
    `CPU - User (in %): \t ${appReqRate.usage.cpuUsage} \n` +
    `Memory - RSS (in MB): \t ${appReqRate.usage.memUsage} \n` +
    `AppServer (nbc-park) request Rate: \t ${appReqRate['nbc-park']} requests/sec \n` +
    `AppServer (nbc-snl-node) request Rate: \t ${appReqRate['nbc-snl-node']} requests/sec \n`;

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
  getMLAppServerStats(appServers, cpuMemUsage) {
    const promises = [];

    appServers.forEach(appServer => promises.push(
        this.get(`manage/v2/servers/${appServer}?view=status&group-id=${this.groupId}&format=${config.format}`)
            .then((serverInfo) => {
              const requestRate =
              serverInfo['server-status']['status-properties']['total-request-rate'].value;

              this.appServerRequestRate[appServer] = requestRate;

              return this.appServerRequestRate;
            })
          .catch(e => Promise.reject(`Error in fetching the appserver statistics
                                      for ${appServer} with ${e}`))
      ));

    this.appServerRequestRate.usage = cpuMemUsage;
    return Promise.all(promises);
  }

  /**
   * Function to format the time to UTC timezone.
   *
   * @return {Date}
   *  Returns the UTC date time.
   */
  utcDateTime() {
    const today = new Date();
    /** Adding the :00Z because the time format of the stats entry in marklogic
     *  is something like 2017-06-14T12:30:00Z. So we need to always have the
     *  seconds value to be considered with '00' and which should end with 'Z'.
     */
    const dateTime = moment.utc(today).format('YYYY-MM-DDTHH:mm').concat(':00Z');
    return dateTime;
  }

  /**
   * Function to fetch the CPU and Memory statistics information.
   *
   * @return {Promise}
   *  Returns the promise object.
   */
  getCPUMemoryStats() {
    return this.get(`manage/v2/hosts?view=metrics&format=${config.format}&period=${this.period}`)
               .then((res) => {
                 const response = {};

                 const metricsArray =
                 res['host-metrics-list']['metrics-relations']['host-metrics-list'].metrics;

                  // Fetching the CPU % utilized for the User.
                 const cpuUserStats = metricsArray.filter(metric =>
                                      Object.keys(metric)[0] === 'total-cpu-stat-user')[0];

                 // Fetching the memory RSS statistics.
                 const memoryRSSStats = metricsArray.filter(metric =>
                                        Object.keys(metric)[0] === 'memory-process-rss')[0];

                 // Finding all the entries the % of CPU utilized.
                 const CPUUserDates = cpuUserStats['total-cpu-stat-user'].summary.data.entry;

                 // Finding all the entries of amount of memory utilized.
                 const memoryRSSDates = memoryRSSStats['memory-process-rss'].summary.data.entry;

                 // Converting to UTC timezone because the required Stats ML
                 // server is running in the UTC time zone.
                 const currentUTCDateTime = this.utcDateTime();

                 // Converting to PST timezone because the message we log in the
                 //  slack channel to represented in PST timezone.
                 const currentPSTDateTime =
                 moment(new Date()).tz('America/Los_Angeles').format('YYYY-MM-DDTHH:mm:ss')
                                   .concat('Z');

                 // Finding the % of CPU utilized for specific time.
                 const cpuValue = CPUUserDates.length === 0 ?
                 CPUUserDates.length : CPUUserDates.filter(date => date.dt === currentUTCDateTime)[0];

                 // Finding the amount of memory utilized for specific time.
                 const memValue = memoryRSSDates.length === 0 ?
                 memoryRSSDates.length : memoryRSSDates.filter(date => date.dt === currentUTCDateTime)[0];

                 response.pstTime = currentPSTDateTime;

                 response.cpuUsage =
                 cpuValue === undefined ? 0 : Math.round(cpuValue.value * 100) / 100;

                 response.memUsage =
                 memValue === undefined ? 0 : Math.round(memValue.value * 100) / 100;

                 return response;
               })
              .catch(e => Promise.reject(`Error in fetching the cpu and memory statistics: ${e}`));
  }

  /**
   * Function to POST the Marklogic statistics to Slack Channel.
   *
   * @return {Promise}
   *  Returns the Promise Object.
   */
  postMLStats() {
    const content = this.getfinalStats();

    const promiseObj = new Promise((resolve, reject) => {
      this.slack.webhook({
        channel: config.get('channelName'),
        username: config.get('groupName'),
        text: content,
      }, (err, res) => {
        if (err) {
          reject(err);
        }
        else {
          resolve(res);
        }
      });
    });
    return promiseObj;
  }
}

module.exports = SlackConfig;
