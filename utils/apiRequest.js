const { ENDPOINT_URL, RUNTIME_HEADER, REQUEST_ID_HEADER } = require('../lib/constants')
const DbError = require('../lib/DbError')
const { EJSON } = require("bson")

/**
 * Execute a POST request to the App Builder Database Service API and return the data field from the result
 *
 * @param {DbBase} db
 * @param {string} apiPath db api url past <ENDPOINT>/v1/
 * @param {Object=} params
 * @param {Object=} options
 * @returns {Promise<*>}
 * @throws {DbError}
 */
async function apiPost(db, apiPath, params = {}, options = {}) {
  const body = params || {}
  if (options) {
    body.options = options
  }
  return await apiRequest(db, `v1/${apiPath}`, 'POST', body)
}

/**
 * Execute a GET request to the App Builder Database Service API and return the data field from the result
 *
 * @param {DbBase} db
 * @param {string} apiPath db api url past <ENDPOINT>/v1/
 * @returns {Promise<*>}
 * @throws {DbError}
 */
async function apiGet(db, apiPath) {
  return await apiRequest(db, `v1/${apiPath}`, 'GET')
}

/**
 * Internal helper method to construct and execute a request to the App Builder Database Service API
 *
 * @param {DbBase} db
 * @param {string} apiPath
 * @param {string} method
 * @param {Object=} body
 * @returns {Promise<*>}
 * @throws {DbError}
 */
async function apiRequest(db, apiPath, method, body = {}) {
  const fullUrl = `${ENDPOINT_URL}/${apiPath}`
  let res
  try {
    const creds = db.runtimeAuth.split(/:(.*)/,2)
    /** @type {Object}
     * @mixes AxiosRequestConfig */
    const reqConfig = {
      headers: { [RUNTIME_HEADER]: db.runtimeNamespace },
      auth: {
        username: creds[0],
        password: creds[1]
      }
    }
    if (method === 'GET') {
      res = await db.axiosClient.get(fullUrl, reqConfig)
    }
    else {
      res = await db.axiosClient.post(fullUrl, EJSON.stringify(body, { relaxed: false }), reqConfig)
    }
  }
  catch (err) {
    if (err.response?.data) {
      const reqId = err.response.data.requestId || err.response.headers[REQUEST_ID_HEADER]
      throw new DbError(
        `Request ${reqId} to ${apiPath} failed with code ${err.response.status}: ${err.response.data.message}`,
        reqId,
        { cause: err }
      )
    }
    throw err
  }

  if (!res.data.success) {
    const reqId = res.data.requestId || res.headers[REQUEST_ID_HEADER]
    throw new DbError(`Request ${reqId} to ${apiPath} failed: ${res.data.message}`, reqId)
  }
  return res.data.data
}

module.exports = {
  apiPost,
  apiGet
}
