const { apiPost, apiGet } = require("../../utils/apiRequest")

/**
 * Make a post request to the abdb proxy service client API and return the result
 *
 * @param {Abdb} abdb
 * @param {string} endpoint
 * @param {Object=} params
 * @param {Object=} options
 * @returns {Promise<*>}
 * @throws {AbdbError}
 */
async function postClientApi(abdb, endpoint, params = {}, options = {}) {
  return await apiPost(abdb, `client/${endpoint}`, params, options)
}

/**
 * Make a get request to the abdb proxy service client API and return the result
 *
 * @param {Abdb} abdb
 * @param {string} endpoint
 * @returns {Promise<*>}
 * @throws {AbdbError}
 */
async function getClientApi(abdb, endpoint) {
  return await apiGet(abdb, `client/${endpoint}`)
}

/**
 * Gets the statistics for a tenant's db
 *
 * @param {Abdb} abdb
 * @returns {Promise<Object>}
 * @throws {AbdbError}
 */
async function dbStats(abdb) {
  return await getClientApi(abdb, 'dbStats')
}

/**
 * Create a new collection
 *
 * @param {Abdb} abdb
 * @param {string} name
 * @param {Object=} options
 * @returns {Promise<void>}
 * @throws {AbdbError}
 */
async function createCollection(abdb, name, options = {}) {
  return await postClientApi(abdb, 'createCollection', { name: name }, options)
}

/**
 * List the collections in a tenant's db
 *
 * @param {Abdb} abdb
 * @param {Object=} filter
 * @param {Object=} options
 * @returns {Promise<Object[]>}
 * @throws {AbdbError}
 */
async function listCollections(abdb, filter = {}, options = {}) {
  const params = filter ? { filter: filter } : {}
  return await postClientApi(abdb, 'listCollections', params, options)
}

/**
 * Close an abdb session
 *
 * @param {Abdb} abdb
 * @returns {Promise<void>}
 * @throws {AbdbError}
 */
async function close(abdb) {
  return await postClientApi(abdb, 'close')
}

module.exports = {
  dbStatsApi: dbStats,
  closeApi: close,
  createCollectionApi: createCollection,
  listCollectionsApi: listCollections
}
