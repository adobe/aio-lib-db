/*
Copyright 2025 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/
require('dotenv/config')
const { pingApi, provisionStatusApi, provisionRequestApi, deleteDatabaseApi } = require('./api/db')
const DbClient = require('./DbClient')
const DbError = require("./DbError")
const { getAxiosClient } = require("../utils/axiosUtils")
const { ALLOWED_REGIONS, ENDPOINTS } = require("./constants")
const { getCliEnv } = require("@adobe/aio-lib-env")

class DbBase {
  /**
   * @param {string} region
   * @param {string} runtimeNamespace
   * @param {string} runtimeAuth
   * @hideconstructor
   */
  constructor(region, runtimeNamespace, runtimeAuth) {
    this.runtimeAuth = runtimeAuth
    if (!this.runtimeAuth) {
      throw new DbError('Runtime auth is required')
    }
    if (!/.+:.+/.test(this.runtimeAuth)) {
      throw new DbError("Invalid format for runtime auth, must be '<user>:<pass>'")
    }

    this.runtimeNamespace = runtimeNamespace
    if (!this.runtimeNamespace) {
      throw new DbError('Runtime namespace is required')
    }

    this.region = region.toLowerCase()
    if (!ALLOWED_REGIONS.includes(this.region)) {
      throw new DbError(`Invalid region '${region}', must be one of: ${ALLOWED_REGIONS.join(', ')}`)
    }
    // Allow overriding service URL via environment variable for testing
    this.serviceUrl = process.env.AIO_DB_ENDPOINT || ENDPOINTS[getCliEnv()].replaceAll(/<region>/gi, this.region)
    this.axiosClient = getAxiosClient()
  }

  /**
   * Instantiates and returns a new DbBase object
   *
   * @static
   * @constructs
   * @param {Object=} config
   * @param {string=} config.namespace required here or as __OW_API_NAMESPACE in .env
   * @param {string=} config.apikey required here or as __OW_API_KEY in .env
   * @param {('amer'|'apac'|'emea')=} config.region optional, default is 'amer'. Allowed values are 'amer', 'emea', 'apac'
   * @returns {Promise<DbBase>} a new DbBase instance
   * @memberof DbBase
   */
  static async init(config = {}) {
    const namespace = config.namespace || process.env.__OW_NAMESPACE
    const apikey = config.apikey || process.env.__OW_API_KEY
    const region = config.region || ALLOWED_REGIONS.at(0)
    return new DbBase(region, namespace, apikey)
  }

  /**
   * Send a request to provision a database scoped to the configured AIO runtime namespace
   *
   * @returns {Promise<Object>}
   * @throws {DbError}
   * @memberof DbBase
   */
  async provisionRequest() {
    return provisionRequestApi(this)
  }

  /**
   * Check the provisioning status for the configured AIO runtime namespace
   *
   * @returns {Promise<Object>}
   * @throws {DbError}
   * @memberof DbBase
   */
  async provisionStatus() {
    return provisionStatusApi(this)
  }

  /**
   * Initialize connection to App Builder Database Service
   *
   * @returns {Promise<DbClient>} a new DbClient instance
   * @throws {DbError}
   * @memberof DbBase
   */
  async connect() {
    return DbClient.init(this)
  }

  /**
   * General connectivity check with App Builder Database Service
   *
   * @returns {Promise<Object>} ping results
   * @throws {DbError}
   * @memberof DbBase
   */
  async ping() {
    return await pingApi(this)
  }

  /**
   * Delete the tenant database for the configured AIO runtime namespace
   *
   * @returns {Promise<Object>}
   * @throws {DbError}
   * @memberof DbBase
   */
  async deleteDatabase() {
    return deleteDatabaseApi(this)
  }
}

module.exports = DbBase
