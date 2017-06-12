'use strict';

const _ = require('lodash');
const config = require('config');
const rp = require('request-promise');

/**
 * Perform all the HTTP Specific actions on the marklogic Server.
 * @class
 */
class configuration {
  /**
   * Constructs the instance to create the configuration object.
   * @constructor
   *
   */
  constructor() {
    this.urlRoot = `${config.get('protocol')}://${config.get('host')}:${config.get('port')}`;
    this.options = {
      auth: config.get('auth'),
      headers: config.get('headers'),
      timeout: config.get('timeout'),
      json: true,
    };
    this.format = config.get('format');
  }

  /**
   * Function to generate the options json object.
   *
   * @param {Object} requiredHeaders
   *   The headers which are required by the caller function.
   * @param {Object} optionalHeaders
   *   The optional Headers to be considered.
   *
   *
   * @return {Object}
   *  Returns the json object.
   */
  getOptions(requiredHeaders, optionalHeaders = {}) {
    return _.merge(
      {},
      this.options,
      {headers: requiredHeaders},
      {headers: optionalHeaders}
    );
  }

  /**
   * Executes a GET request
   *
   * @param {string} url
   *   The url to be requested. Should not include the host and port.
   * @param {Object} [headers]
   *   Any headers that need to be added to the request
   *
   * @return {object}
   *    A object that resolves when the server has responded.
   */
  get(url) {
    return rp.get(`${this.urlRoot}/${url}`, this.options);
  }

}

module.exports = configuration;
