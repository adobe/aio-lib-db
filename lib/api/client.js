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
 * Make a post request to the App Builder Database Service API and return the result
 *
 * @param {DbBase} db
 * @param {string} endpoint
 * @param {Object=} params
 * @param {Object=} options
 * @param {AxiosInstance=} axiosClient
 * @returns {Promise<*>}
 * @throws {DbError}
 */
async function postClientApi(db, endpoint, params = {}, options = {}, axiosClient = undefined) {
  const client = axiosClient || db.axiosClient;
  return await apiPost(db, client, `client/${endpoint}`, params, options)
}

/**
 * Make a get request to the App Builder Database Service API and return the result
 *
 * @param {DbBase} db
 * @param {string} endpoint
 * @returns {Promise<*>}
 * @throws {DbError}
 */
async function getClientApi(db, endpoint) {
  return await apiGet(db, db.axiosClient, `client/${endpoint}`)
}

/**
 * Gets the statistics for the scoped database
 *
 * @param {DbBase} db
 * @param {Object=} options
 * @returns {Promise<Object>}
 * @throws {DbError}
 */
async function dbStats(db, options = {}) {
  return await postClientApi(db, 'dbStats', undefined, options)
}

/**
 * Gets the combined statistics for all databases that fall under the same organization as the scoped database
 *
 * @param {DbBase} db
 * @param {Object=} options
 * @returns {Promise<Object>}
 * @throws {DbError}
 */
async function orgStats(db, options = {}) {
  return await postClientApi(db, 'orgStats', undefined, options)
}

/**
 * Create a new collection in the scoped database
 *
 * @param {DbBase} db
 * @param {string} name
 * @param {Object=} options
 * @returns {Promise<void>}
 * @throws {DbError}
 */
async function createCollection(db, name, options = {}) {
  return await postClientApi(db, 'createCollection', { name: name }, options)
}

/**
 * List the collections in the scoped database
 *
 * @param {DbBase} db
 * @param {Object=} filter
 * @param {Object=} options
 * @returns {Promise<Object[]>}
 * @throws {DbError}
 */
async function listCollections(db, filter = {}, options = {}) {
  return await postClientApi(db, 'listCollections', { filter: filter }, options)
}

/**
 * Close a database session
 *
 * @param {DbBase} db
 * @param {AxiosInstance} axiosClient
 * @returns {Promise<void>}
 * @throws {DbError}
 */
async function close(db, axiosClient) {
  return await postClientApi(db, 'close', undefined, undefined, axiosClient)
}

module.exports = {
  dbStatsApi: dbStats,
  orgStatsApi: orgStats,
  closeApi: close,
  createCollectionApi: createCollection,
  listCollectionsApi: listCollections
}
