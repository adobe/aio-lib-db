const { apiPost, apiGet } = require("../../utils/apiRequest")

/**
 * Make a post request to the abdb proxy service db API and return the result
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
 * Make a get request to the abdb proxy service db API and return the result
 *
 * @param {Abdb} abdb
 * @param {string} endpoint
 * @param {string=} tenantId
 * @returns {Promise<*>}
 * @throws {AbdbError}
 */
async function getDbApi(abdb, endpoint, tenantId = undefined) {
  return await apiGet(abdb, `db/${endpoint}`, tenantId)
}

/**
 * Start an ABDB session
 *
 * @param {Abdb} abdb
 * @returns {Promise<*>}
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
 * Provision a new tenant and return the id
 *
 * TODO: Remove in favor of provisionRequest as part of CEXT-4671
 *
 * @param {string} region
 * @param {Abdb} abdb
 * @returns {Promise<{"tenant_id": string}>}
 * @throws {AbdbError}
 */
async function provision(region, abdb) {
  return await postDbApi(abdb, 'provision', { region: region })
}

/**
 * Checks if a tenant has been provisioned
 *
 * TODO: Remove in favor of provisionStatus as part of CEXT-4671
 *
 * @param {string} tenantId
 * @param {Abdb} abdb
 * @returns {Promise<boolean>}
 * @throws {AbdbError}
 */
async function status(tenantId, abdb) {
  return await getDbApi(abdb, 'status', tenantId)
}

/**
 * Checks connectivity with ABDB
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
  provisionApi: provision,
  statusApi: status,
  pingApi: ping
}
