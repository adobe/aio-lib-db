const { apiPost, apiGet } = require("../../utils/apiRequest")

/**
 * Make a post request to the abdb proxy service client API and return the result
 *
 * @param {string} tenantId
 * @param {AxiosStatic} axiosClient
 * @param {string} endpoint
 * @param {Object=} params
 * @param {Object=} options
 * @returns {Promise<*>}
 * @throws {AbdbError}
 */
async function postClientApi(tenantId, axiosClient, endpoint, params = {}, options = {}) {
  return await apiPost(axiosClient, `client/${endpoint}`, tenantId, params, options)
}

/**
 * Make a get request to the abdb proxy service client API and return the result
 *
 * @param {string} tenantId
 * @param {AxiosStatic} axiosClient
 * @param {string} endpoint
 * @returns {Promise<*>}
 * @throws {AbdbError}
 */
async function getClientApi(tenantId, axiosClient, endpoint) {
  return await apiGet(axiosClient, `client/${endpoint}`, tenantId)
}

/**
 * Gets the statistics for a tenant's db
 *
 * @param {string} tenantId
 * @param {AxiosStatic} axiosClient
 * @returns {Promise<Object>}
 * @throws {AbdbError}
 */
async function dbStats(tenantId, axiosClient) {
  return await getClientApi(tenantId, axiosClient, 'dbStats')
}

/**
 * List the collections in a tenant's db
 * @param {string} tenantId
 * @param {AxiosStatic} axiosClient
 * @param {Object=} filter
 * @param {Object=} options
 * @returns {Promise<Object[]>}
 * @throws {AbdbError}
 */
async function listCollections(tenantId, axiosClient, filter = {}, options = {}) {
  const params = filter ? { filter: filter } : {}
  return await postClientApi(tenantId, axiosClient, 'listCollections', params, options)
}

/**
 * Close an abdb session
 *
 * @param {string} tenantId
 * @param {AxiosStatic} axiosClient
 * @returns {Promise<Object>}
 * @throws {AbdbError}
 */
async function close(tenantId, axiosClient) {
  return await postClientApi(tenantId, axiosClient, 'close')
}

module.exports = {
  dbStatsApi: dbStats,
  closeApi: close,
  listCollectionsApi: listCollections
}
