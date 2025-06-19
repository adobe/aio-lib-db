const { apiPost, apiGet } = require("../../utils/apiRequest")

/**
 * Make a post request to the App Builder Database Service db API and return the result
 *
 * @param {DbBase} db
 * @param {string} endpoint
 * @param {Object=} params
 * @param {Object=} options
 * @returns {Promise<*>}
 * @throws {DbError}
 */
async function postDbApi(db, endpoint, params = {}, options = {}) {
  return await apiPost(db, `db/${endpoint}`, params, options)
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
  return await postDbApi(db, 'connect')
}

/**
 * Submit a request to provision a new database for the current runtime namespace
 *
 * @param {DbBase} db
 * @param {string=} region
 * @returns {Promise<Object>}
 * @throws {DbError}
 */
async function provisionRequest(db, region = 'default') {
  return await postDbApi(db, 'provision/request', { region: region })
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
