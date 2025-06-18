const { apiPost, apiGet } = require("../../utils/apiRequest")

/**
 * Make a post request to the DB Proxy Service client API and return the result
 *
 * @param {Db} db
 * @param {string} endpoint
 * @param {Object=} params
 * @param {Object=} options
 * @returns {Promise<*>}
 * @throws {DbError}
 */
async function postClientApi(db, endpoint, params = {}, options = {}) {
  return await apiPost(db, `client/${endpoint}`, params, options)
}

/**
 * Make a get request to the DB Proxy Service client API and return the result
 *
 * @param {Db} db
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
 * @param {Db} db
 * @returns {Promise<Object>}
 * @throws {DbError}
 */
async function dbStats(db) {
  return await getClientApi(db, 'dbStats')
}

/**
 * Create a new collection in the scoped database
 *
 * @param {Db} db
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
 * @param {Db} db
 * @param {Object=} filter
 * @param {Object=} options
 * @returns {Promise<Object[]>}
 * @throws {DbError}
 */
async function listCollections(db, filter = {}, options = {}) {
  const params = filter ? { filter: filter } : {}
  return await postClientApi(db, 'listCollections', params, options)
}

/**
 * Close a database session
 *
 * @param {Db} db
 * @returns {Promise<void>}
 * @throws {DbError}
 */
async function close(db) {
  return await postClientApi(db, 'close')
}

module.exports = {
  dbStatsApi: dbStats,
  closeApi: close,
  createCollectionApi: createCollection,
  listCollectionsApi: listCollections
}
