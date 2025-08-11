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
const { apiPost, apiGet } = require("../../utils/apiRequest")

/**
 * Make a post request to the App Builder Database Service db API and return the result
 *
 * @param {DbBase} db
 * @param {string} endpoint
 * @param {Object=} params
 * @param {Object=} options
 * @param {boolean=} withSession
 * @returns {Promise<*>}
 * @throws {DbError}
 */
async function postDbApi(db, endpoint, params = {}, options = {}, withSession = false) {
  return await apiPost(db, `db/${endpoint}`, params, options, withSession)
}

/**
 * Make a get request to the App Builder Database Service db API and return the result
 *
 * @param {DbBase} db
 * @param {string} endpoint
 * @returns {Promise<*>}
 * @throws {DbError}
 */
async function getDbApi(db, endpoint) {
  return await apiGet(db, `db/${endpoint}`)
}

/**
 * Start a database session
 *
 * @param {DbBase} db
 * @returns {Promise<void>}
 * @throws {DbError}
 */
async function connect(db) {
  return await postDbApi(db, 'connect', undefined, undefined, true)
}

/**
 * Submit a request to provision a new database for the current runtime namespace
 *
 * @param {DbBase} db
 * @returns {Promise<Object>}
 * @throws {DbError}
 */
async function provisionRequest(db) {
  return await postDbApi(db, 'provision/request')
}

/**
 * Gets the provisioning status for the current runtime namespace
 *
 * @param {DbBase} db
 * @returns {Promise<Object>}
 * @throws {DbError}
 */
async function provisionStatus(db) {
  return await postDbApi(db, 'provision/status')
}

/**
 * Checks connectivity with the App Builder Database Service
 *
 * @param {DbBase} db
 * @returns {Promise<string>}
 * @throws {DbError}
 */
async function ping(db) {
  return await getDbApi(db, 'ping')
}

module.exports = {
  connectApi: connect,
  provisionRequestApi: provisionRequest,
  provisionStatusApi: provisionStatus,
  pingApi: ping
}
