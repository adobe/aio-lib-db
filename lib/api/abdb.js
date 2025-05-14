const { apiPost, apiGet } = require("../../utils/apiRequest")

/**
 * Make a post request to the abdb proxy service db API and return the result
 *
 * @param {AxiosStatic} axiosClient
 * @param {string} endpoint
 * @param {string=} tenantId
 * @param {Object=} params
 * @param {Object=} options
 * @returns {Promise<*>}
 * @throws {AbdbError}
 */
async function postDbApi(axiosClient, endpoint, tenantId = undefined, params = {}, options = {}) {
  return await apiPost(axiosClient, `db/${endpoint}`, tenantId, params, options)
}

/**
 * Make a get request to the abdb proxy service db API and return the result
 *
 * @param {AxiosStatic} axiosClient
 * @param {string} endpoint
 * @param {string=} tenantId
 * @returns {Promise<*>}
 * @throws {AbdbError}
 */
async function getDbApi(axiosClient, endpoint, tenantId = undefined) {
  return await apiGet(axiosClient, `db/${endpoint}`, tenantId)
}

/**
 * Start an ABDB session
 *
 * @param {string} tenantId
 * @param {AxiosStatic} axiosClient
 * @returns {Promise<*>}
 * @throws {AbdbError}
 */
async function connect(tenantId, axiosClient) {
  return await postDbApi(axiosClient, 'connect', tenantId)
}

/**
 * Provision a new tenant and return the id
 *
 * @param {string} region
 * @param {AxiosStatic} axiosClient
 * @returns {Promise<{"tenant_id": string}>}
 * @throws {AbdbError}
 */
async function provision(region, axiosClient) {
  return await postDbApi(axiosClient, 'provision', undefined, { region: region })
}

/**
 * Checks if a tenant has been provisioned
 *
 * @param {string} tenantId
 * @param {AxiosStatic} axiosClient
 * @returns {Promise<boolean>}
 * @throws {AbdbError}
 */
async function status(tenantId, axiosClient) {
  return await getDbApi(axiosClient, 'status', tenantId)
}

module.exports = {
  connectApi: connect,
  provisionApi: provision,
  statusApi: status
}
