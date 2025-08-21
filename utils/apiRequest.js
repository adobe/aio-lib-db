/*
Copyright 2025 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/
const { RUNTIME_HEADER, REQUEST_ID_HEADER } = require('../lib/constants')
const DbError = require('../lib/DbError')
const { EJSON } = require("bson")

/**
 * Execute a POST request to the App Builder Database Service API and return the data field from the result
 *
 * @param {DbBase} db
 * @param {AxiosInstance} axiosClient
 * @param {string} apiPath db api url past <ENDPOINT>/v1/
 * @param {Object=} params
 * @param {Object=} options
 * @returns {Promise<*>}
 * @throws {DbError}
 */
async function apiPost(db, axiosClient, apiPath, params = {}, options = {}) {
  const body = params
  if (Object.keys(options).length > 0) {
    body.options = options
  }
  return await apiRequest(db, axiosClient, `v1/${apiPath}`, 'POST', body)
}

/**
 * Execute a GET request to the App Builder Database Service API and return the data field from the result
 *
 * @param {DbBase} db
 * @param {AxiosInstance} axiosClient
 * @param {string} apiPath db api url past <ENDPOINT>/v1/
 * @returns {Promise<*>}
 * @throws {DbError}
 */
async function apiGet(db, axiosClient, apiPath) {
  return await apiRequest(db, axiosClient, `v1/${apiPath}`, 'GET')
}

/**
 * Internal helper method to construct and execute a request to the App Builder Database Service API
 *
 * @param {DbBase} db
 * @param {AxiosInstance} axiosClient
 * @param {string} apiPath
 * @param {string} method
 * @param {Object=} body
 * @returns {Promise<*>}
 * @throws {DbError}
 */
async function apiRequest(db, axiosClient, apiPath, method, body = {}) {
  const fullUrl = `${db.serviceUrl}/${apiPath}`
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
      res = await axiosClient.get(fullUrl, reqConfig)
    }
    else {
      res = await axiosClient.post(fullUrl, EJSON.stringify(body, { relaxed: false }), reqConfig)
    }
  }
  catch (err) {
    if (err.response?.data) {
      const reqId = err.response.data.requestId || err.response.headers[REQUEST_ID_HEADER]
      throw new DbError(
        `Request ${reqId} to ${apiPath} failed with code ${err.response.status}: ${err.response.data.message}`,
        reqId,
        err.response.status,
        { cause: err }
      )
    }
    throw err
  }

  if (!res.data.success) {
    const reqId = res.data.requestId || res.headers[REQUEST_ID_HEADER]
    throw new DbError(`Request ${reqId} to ${apiPath} failed: ${res.data.message}`, reqId, res.status)
  }
  return res.data.data
}

module.exports = {
  apiPost,
  apiGet
}
