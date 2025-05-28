const { ENDPOINT_URL, RUNTIME_HEADER, TENANT_HEADER } = require('../lib/constants')
const AbdbError = require('../lib/abdbError')
const { EJSON } = require("bson")

/**
 * Hit the abdb proxy service API and return the data field from the result
 *
 * @param {Abdb} abdb
 * @param {string} apiPath abdb api url past <ENDPOINT>/v1/
 * @param {Object=} params
 * @param {Object=} options
 * @param {string=} tenantId TODO: Remove tenancy in favor of runtime, see CEXT-4671
 * @returns {Promise<*>}
 * @throws {AbdbError}
 */
async function apiPost(abdb, apiPath, params = {}, options = {}, tenantId = undefined) {
  const endpoint = apiPath.substring(apiPath.lastIndexOf('/') + 1)
  let res
  try {
    /** @type {Object}
     * @mixes AxiosRequestConfig */
    const reqConfig = {
      headers: { [RUNTIME_HEADER]: abdb.runtimeNamespace },
      auth: { // TODO: Implement basic auth, see CEXT-4617
        username: 'user',
        password: 'pass'
      }
    }
    if (tenantId || abdb.tenantId) {
      reqConfig.headers[TENANT_HEADER] = tenantId || abdb.tenantId
    }
    const body = params
    if (options) {
      body.options = options
    }
    res = await abdb.axiosClient.post(
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
 * @param {Abdb} abdb
 * @param {string} apiPath abdb api url past <ENDPOINT>/v1/
 * @param {string=} tenantId TODO: Remove tenancy in favor of runtime, see CEXT-4671
 * @returns {Promise<*>}
 * @throws {AbdbError}
 */
async function apiGet(abdb, apiPath, tenantId = undefined) {
  const endpoint = apiPath.substring(apiPath.lastIndexOf('/') + 1)
  let res
  try {
    /** @type {Object}
     * @mixes AxiosRequestConfig */
    const reqConfig = {
      headers: { [RUNTIME_HEADER]: abdb.runtimeNamespace },
      auth: { // TODO: Implement basic auth, see CEXT-4617
        username: 'user',
        password: 'pass'
      }
    }
    if (tenantId || abdb.tenantId) {
      reqConfig.headers[TENANT_HEADER] = tenantId || abdb.tenantId
    }
    res = await abdb.axiosClient.get(`${ENDPOINT_URL}/v1/${apiPath}`, reqConfig)
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
