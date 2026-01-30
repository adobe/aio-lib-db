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
const { getRegionFromAppConfig } = require("../utils/manifestUtils")
const {
  ALLOWED_REGIONS, STAGE_ENV, STAGE_ENDPOINT, PROD_ENDPOINT_RUNTIME, PROD_ENDPOINT_EXTERNAL
} = require("./constants")
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
    const env = process.env.AIO_DB_ENVIRONMENT || getCliEnv()
    const validRegions = ALLOWED_REGIONS[env]
    if (!validRegions.includes(this.region)) {
      throw new DbError(`Invalid region '${region}' for the ${env} environment, must be one of: ${validRegions.join(', ')}`)
    }

    let serviceUrl
    // Allow overriding service URL via environment variable for testing
    if (process.env.AIO_DB_ENDPOINT) {
      serviceUrl = process.env.AIO_DB_ENDPOINT
    }
    else {
      if (env === STAGE_ENV) {
        // Stage environment does not have a separate runtime endpoint
        serviceUrl = STAGE_ENDPOINT
      }
      else if (process.env.__OW_ACTIVATION_ID && !process.env.AIO_DEV) {
        // If __OW_ACTIVATION_ID is set, the sdk is being used from inside a runtime action and should use the internal
        // endpoint unless it's being executed by "aio app dev" (AIO_DEV is set)
        serviceUrl = PROD_ENDPOINT_RUNTIME
      }
      else {
        serviceUrl = PROD_ENDPOINT_EXTERNAL
      }
      serviceUrl = serviceUrl.replaceAll(/<region>/gi, this.region)
    }

    this.serviceUrl = serviceUrl
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
   * @param {string=} config.region optional, default is 'amer'. Allowed prod values are 'amer', 'emea', 'apac'
   * @returns {Promise<DbBase>} a new DbBase instance
   * @memberof DbBase
   */
  static async init(config = {}) {
    const namespace = config.namespace || process.env.__OW_NAMESPACE
    const apikey = config.apikey || process.env.__OW_API_KEY
    let aioAppRegion = null
    
    try {
      aioAppRegion = getRegionFromAppConfig(process.cwd())
    } catch (e) {
      throw new DbError(`Error reading region from app config: ${e.message}`)
    }

    const region = aioAppRegion || config.region || ALLOWED_REGIONS[getCliEnv()].at(0)
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
