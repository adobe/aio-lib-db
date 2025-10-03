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
const { RUNTIME_HEADER, PROD_ENV } = require("../lib/constants")
const DbBase = require("../lib/DbBase")
const { default: axios, TEST_REGION, TEST_SERVICE_URL } = require('axios')
const { HttpCookieAgent, HttpsCookieAgent } = require("http-cookie-agent/http")
const { EJSON } = require("bson")

const TEST_USER = 'testUser'
const TEST_PASS = 'testPass'

const TEST_AUTH = `${TEST_USER}:${TEST_PASS}`
const TEST_NAMESPACE = `testNamespace`

const TEST_REQ_CONFIG = {
  headers: { [RUNTIME_HEADER]: TEST_NAMESPACE },
  auth: {
    username: TEST_USER,
    password: TEST_PASS
  }
}

beforeEach(() => {
  jest.clearAllMocks()
  // Set the environment to production for tests
  process.env.AIO_DB_ENVIRONMENT = PROD_ENV
  process.env.AIO_CLI_ENV = PROD_ENV // AIO_DB_ENVIRONMENT takes precedence over AIO_CLI_ENV, but we want to be sure
  delete process.env.AIO_DB_ENDPOINT // Ensure no endpoint override
})

function getDb() {
  const db = new DbBase(TEST_REGION, TEST_NAMESPACE, TEST_AUTH)
  // Ensure that an axios client has been created without session cookie tracking
  expect(axios.create).toHaveBeenCalledWith()
  expect(db.axiosClient.cookieJar).toBeUndefined()
  return db
}

function getAxiosFromCursor(cursor) {
  // Ensure that an axios client has been created with session cookie tracking and is attached to the cursor
  expect(axios.create).toHaveBeenCalledWith({
    httpAgent: expect.any(HttpCookieAgent),
    httpsAgent: expect.any(HttpsCookieAgent)
  })
  const axiosClient = cursor._axiosClient
  expect(axiosClient.cookieJar).toBeDefined()
  return axiosClient
}

/**
 * Custom jest matcher to compare objects encoded as EJSON strings ignoring field order
 *
 * @param {string} actualString
 * @param {string} expectedString
 */
function toEqualEjson(actualString, expectedString) {
  if (typeof actualString !== 'string') {
    return {
      message: () => `expected ${this.utils.printReceived(actualString)} to be an EJSON string`,
      pass: false
    }
  }
  if (typeof expectedString !== 'string') {
    return {
      message: () => `expected ${this.utils.printReceived(expectedString)} to be an EJSON string`,
      pass: false
    }
  }
  const actual = EJSON.parse(actualString, { relaxed: false })
  const expected = EJSON.parse(expectedString, { relaxed: false })
  if (this.equals(actual, expected)) {
    return {
      message: () => `expected ${this.utils.printReceived(actual)} not to equal ${this.utils.printReceived(expected)}`,
      pass: true
    }
  }
  else {
    return {
      message: () => `expected ${this.utils.printReceived(actual)} to equal ${this.utils.printReceived(expected)}`,
      pass: false
    }
  }
}

/**
 * Custom jest tester to check post requests to service api.
 * Functions as expect(axiosClient.post).toHaveBeenCalledWith(`<BASE_URL>/${route}`, body, <runtime/auth headers>)
 * Not passing the body parameter will only check the URL and headers
 * If the times parameter is provided, it will check that the request was made exactly that many times.
 *
 * Example use:
 *   await dbCollection.dropIndex('PriceIndex')
 *   expect(axiosClient).toHaveCalledServicePost('v1/collection/testCollection/dropIndex', { index: 'PriceIndex' })
 *
 * @param {AxiosInstance} axiosClient
 * @param {string} route
 * @param {Object=} body
 * @param {number=} times
 */
function toHaveCalledServicePost(axiosClient, route, body = undefined, times = undefined) {
  const url = route.startsWith('http') ? route : `${TEST_SERVICE_URL}/${route}`
  const bodyMatcher = body ? expect.toEqualEjson(EJSON.stringify(body, { relaxed: false })) : expect.anything()
  try {
    if (times !== undefined) {
      const calls = axiosClient.post.mock.calls.filter(call => call[0] === url && this.equals(call[1], bodyMatcher))
      expect(calls).toHaveLength(times)
      return {
        pass: true,
        message: () => `expected axios not to make a POST request ${times} times to ${url} with body: ${body || '<anything>'}`
      }
    }
    else {
      expect(axiosClient.post).toHaveBeenCalledWith(url, bodyMatcher, TEST_REQ_CONFIG)
      return {
        pass: true,
        message: () => `expected axios not to make a POST request to ${url} with body: ${body || '<anything>'}`
      }
    }
  }
  catch (e) {
    if (e.matcherResult) {
      return {
        pass: false,
        message: () => e.matcherResult.message
      }
    }
    throw e
  }
}

/**
 * Custom jest tester to check get requests to service api.
 * Functions as expect(axiosClient.get).toHaveBeenCalledWith(`<BASE_URL>/${route}`, <runtime/auth headers>)
 *
 * Example use:
 *   await dbClient.dbStats()
 *   expect(axiosClient).toHaveCalledServiceGet('v1/client/dbStats')
 *
 * @param {AxiosInstance} axiosClient
 * @param {string} route
 */
function toHaveCalledServiceGet(axiosClient, route) {
  const url = route.startsWith('http') ? route : `${TEST_SERVICE_URL}/${route}`
  try {
    expect(axiosClient.get).toHaveBeenCalledWith(url, TEST_REQ_CONFIG)
    return {
      pass: true,
      message: () => `expected axios not to make a GET request to ${url}`
    }
  }
  catch (e) {
    if (e.matcherResult) {
      return {
        pass: false,
        message: () => e.matcherResult.message
      }
    }
    throw e
  }
}

/**
 * Custom jest matcher to check if a function throws an error with specific properties.
 *
 * errMatcher accepts either a function that takes the error object and returns a boolean
 * or an object with the expected properties as key-value pairs.
 *
 * Example use:
 *   await expect(async () => {
 *     await apiGet(db, 'unrecognized/endpoint')
 *   }).toThrowErrorWithProperties({ httpStatusCode: 404 }, 'DbError')
 *
 * @param {function} asyncFn
 * @param {function|Object} errMatcher
 * @param {string=} errorType
 */
async function toThrowErrorWithProperties(asyncFn, errMatcher, errorType = '') {
  try {
    await asyncFn()
    return { pass: false, message: () => `expected error to be thrown` }
  }
  catch (e) {
    const errOut = JSON.stringify(e)
    if (errorType && e.constructor.name !== errorType) {
      return { pass: false, message: () => `expected error to be of type ${errorType}, but got ${e.constructor.name}` }
    }
    if (typeof errMatcher === 'function') {
      if (errMatcher(e)) {
        return { pass: true, message: () => `expected error not to match, but got ${errOut}` }
      }
      else {
        return { pass: false, message: () => `expected error to match, but got ${errOut}` }
      }
    }
    else {
      const matcherOut = JSON.stringify(errMatcher)
      const properties = Object.keys(errMatcher)
      for (const prop of properties) {
        if (!e.hasOwnProperty(prop) || !this.equals(e[prop], errMatcher[prop])) {
          return { pass: false, message: () => `expected error to have properties ${matcherOut}, but got ${errOut}` }
        }
      }
      return { pass: true, message: () => `expected error not to have properties ${matcherOut}, but got ${errOut}` }
    }
  }
}

expect.extend({ toEqualEjson, toHaveCalledServicePost, toHaveCalledServiceGet, toThrowErrorWithProperties })

module.exports = {
  getDb,
  TEST_NAMESPACE,
  TEST_AUTH,
  getAxiosFromCursor
}
