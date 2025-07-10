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
 * @param {boolean=} withSession
 * @returns {Promise<*>}
 * @throws {DbError}
 */
async function postClientApi(db, endpoint, params = {}, options = {}, withSession = false) {
  return await apiPost(db, `client/${endpoint}`, params, options, withSession)
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
  return await apiGet(db, `client/${endpoint}`)
}

/**
 * Gets the statistics for the scoped database
 *
 * @param {DbBase} db
 * @returns {Promise<Object>}
 * @throws {DbError}
 */
async function dbStats(db) {
  return await getClientApi(db, 'dbStats')
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
 * @returns {Promise<void>}
 * @throws {DbError}
 */
async function close(db) {
  return await postClientApi(db, 'close', undefined, undefined, true)
}

module.exports = {
  dbStatsApi: dbStats,
  closeApi: close,
  createCollectionApi: createCollection,
  listCollectionsApi: listCollections
}
