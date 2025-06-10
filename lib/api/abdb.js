const { apiPost, apiGet } = require("../../utils/apiRequest")

/**
 * Make a post request to the ABDB Proxy Service API and return the result
 *
 * @param {Abdb} abdb
 * @param {string} endpoint
 * @param {Object=} params
 * @param {Object=} options
 * @returns {Promise<*>}
 * @throws {AbdbError}
 */
async function postDbApi(abdb, endpoint, params = {}, options = {}) {
  return await apiPost(abdb, `db/${endpoint}`, params, options)
}

/**
 * Make a get request to the ABDB Proxy Service API and return the result
 *
 * @param {Abdb} abdb
 * @param {string} endpoint
 * @returns {Promise<*>}
 * @throws {AbdbError}
 */
async function getDbApi(abdb, endpoint) {
  return await apiGet(abdb, `db/${endpoint}`)
}

/**
 * Start an ABDB session
 *
 * @param {Abdb} abdb
 * @returns {Promise<void>}
 * @throws {AbdbError}
 */
async function connect(abdb) {
  return await postDbApi(abdb, 'connect')
}

/**
 * Submit a request to provision a new database for the current runtime namespace
 *
 * @param {Abdb} abdb
 * @param {string=} region
 * @returns {Promise<Object>}
 * @throws {AbdbError}
 */
async function provisionRequest(abdb, region = 'default') {
  return await postDbApi(abdb, 'provision/request', { region: region })
}

/**
 * Gets the provisioning status for the current runtime namespace
 *
 * @param {Abdb} abdb
 * @returns {Promise<Object>}
 * @throws {AbdbError}
 */
async function provisionStatus(abdb) {
  return await postDbApi(abdb, 'provision/status')
}

/**
 * Checks connectivity with the ABDB Proxy Service
 *
 * @param {Abdb} abdb
 * @returns {Promise<string>}
 * @throws {AbdbError}
 */
async function ping(abdb) {
  return await getDbApi(abdb, 'ping')
}

module.exports = {
  connectApi: connect,
  provisionRequestApi: provisionRequest,
  provisionStatusApi: provisionStatus,
  pingApi: ping
}
