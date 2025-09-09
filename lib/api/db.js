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
 * @param {AxiosInstance} axiosClient
 * @param {string} endpoint
 * @param {Object=} params
 * @param {Object=} options
 * @returns {Promise<*>}
 * @throws {DbError}
 */
async function postDbApi(db, axiosClient, endpoint, params = {}, options = {}) {
  return await apiPost(db, axiosClient, `db/${endpoint}`, params, options)
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
  return await apiGet(db, db.axiosClient, `db/${endpoint}`)
}

/**
 * Submit a request to provision a new database for the current runtime namespace
 *
 * @param {DbBase} db
 * @returns {Promise<Object>}
 * @throws {DbError}
 */
async function provisionRequest(db) {
  return await postDbApi(db, db.axiosClient, 'provision/request')
}

/**
 * Gets the provisioning status for the current runtime namespace
 *
 * @param {DbBase} db
 * @returns {Promise<Object>}
 * @throws {DbError}
 */
async function provisionStatus(db) {
  return await postDbApi(db, db.axiosClient, 'provision/status')
}

/**
 * Checks connectivity with the App Builder Database Service
 *
 * @param {DbBase} db
 * @returns {Promise<Object>}
 * @throws {DbError}
 */
async function ping(db) {
  return await getDbApi(db, 'ping')
}

/**
 * Delete the tenant database for the current runtime namespace
 *
 * @param {DbBase} db
 * @returns {Promise<Object>}
 * @throws {DbError}
 */
async function deleteDatabase(db) {
  return await postDbApi(db, db.axiosClient, 'delete')
}

module.exports = {
  provisionRequestApi: provisionRequest,
  provisionStatusApi: provisionStatus,
  pingApi: ping,
  deleteDatabaseApi: deleteDatabase
}
