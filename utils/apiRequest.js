const { ENDPOINT_URL } = require('../lib/constants')
const AbdbError = require('../lib/abdbError')
const { EJSON } = require("bson")

/**
 * Hit the abdb proxy service API and return the data field from the result
 *
 * @param {AxiosStatic} axiosClient
 * @param {string} apiPath abdb api url past <ENDPOINT>/v1/
 * @param {string=} tenantId
 * @param {Object=} params
 * @param {Object=} options
 * @returns {Promise<*>}
 * @throws {AbdbError}
 */
async function apiPost(axiosClient, apiPath, tenantId = undefined, params = {}, options = {}) {
  const endpoint = apiPath.substring(apiPath.lastIndexOf('/') + 1)
  let res
  try {
    /** @type {Object}
     * @mixes AxiosRequestConfig */
    const reqConfig = {
      headers: {
        'x-runtime-namespace': 'RUNTIME_PLACEHOLDER', // TODO: Implement runtime namespace validation, see CEXT-4617
      },
      auth: { // TODO: Implement basic auth, see CEXT-4617
        username: 'user',
        password: 'pass'
      }
    }
    if (tenantId) {
      reqConfig.headers['x-abdb-tenant-id'] = tenantId
    }
    const body = params
    if (options) {
      body.options = options
    }
    res = await axiosClient.post(
      `${ENDPOINT_URL}/v1/${apiPath}`,
      EJSON.stringify(body, { relaxed: false }),
      reqConfig
    )
  }
  catch (err) {
    if (err.response?.data) {
      throw new AbdbError(`${endpoint} failed: ${err.response.data.message}`, { cause: err })
    }
    throw err
  }

  if (!res.data.success) {
    throw new AbdbError(`${endpoint} failed: ${res.data.message}`)
  }
  return res.data.data
}

/**
 * Hit the abdb proxy service API and return the data field from the result
 *
 * @param {AxiosStatic} axiosClient
 * @param {string} apiPath abdb api url past <ENDPOINT>/v1/
 * @param {string=} tenantId
 * @returns {Promise<*>}
 * @throws {AbdbError}
 */
async function apiGet(axiosClient, apiPath, tenantId = undefined) {
  const endpoint = apiPath.substring(apiPath.lastIndexOf('/') + 1)
  let res
  try {
    /** @type {Object}
     * @mixes AxiosRequestConfig */
    const reqConfig = {
      headers: {
        'x-runtime-namespace': 'RUNTIME_PLACEHOLDER', // TODO: Implement runtime namespace validation, see CEXT-4617
      },
      auth: { // TODO: Implement basic auth, see CEXT-4617
        username: 'user',
        password: 'pass'
      }
    }
    if (tenantId) {
      reqConfig.headers['x-abdb-tenant-id'] = tenantId
    }
    res = await axiosClient.get(`${ENDPOINT_URL}/v1/${apiPath}`, reqConfig)
  }
  catch (err) {
    if (err.response?.data) {
      throw new AbdbError(`${endpoint} failed: ${err.response.data.message}`, { cause: err })
    }
    throw err
  }

  if (!res.data.success) {
    throw new AbdbError(`${endpoint} failed: ${res.data.message}`)
  }
  return res.data.data
}

module.exports = {
  apiPost,
  apiGet
}
