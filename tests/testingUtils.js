const { RUNTIME_HEADER, ENDPOINT_URL } = require("../lib/constants")
const DbBase = require("../lib/DbBase")
const { default: axios } = require('axios')
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
})

function getDb() {
  const db = new DbBase(TEST_NAMESPACE, TEST_AUTH)
  // Ensure that cookies are being tracked for session
  expect(axios.create).toHaveBeenCalledWith({
    httpAgent: expect.any(HttpCookieAgent),
    httpsAgent: expect.any(HttpsCookieAgent)
  })
  return db
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
 * Functions as expect(axiosClient.post).toHaveBeenCalledWith(`${ENDPOINT_URL}/${route}`, body, <runtime/auth headers>)
 *
 * Example use:
 *   await dbCollection.hideIndex('PriceIndex')
 *   expect(axiosClient).toHaveCalledServicePost('v1/collection/testCollection/hideIndex', { index: 'PriceIndex' })
 *
 * @param {AxiosInstance} axiosClient
 * @param {string} route
 * @param {Object} body
 */
function toHaveCalledServicePost(axiosClient, route, body) {
  const url = `${ENDPOINT_URL}/${route}`
  body = EJSON.stringify(body, { relaxed: false })
  try {
    expect(axiosClient.post).toHaveBeenCalledWith(url, expect.toEqualEjson(body), TEST_REQ_CONFIG)
    return {
      pass: true,
      message: () => `expected axios not to make a POST request to ${url} with body: ${body}`
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
 * Functions as expect(axiosClient.get).toHaveBeenCalledWith(`${ENDPOINT_URL}/${route}`, <runtime/auth headers>)
 *
 * Example use:
 *   await dbClient.dbStats()
 *   expect(axiosClient).toHaveCalledServiceGet('v1/client/dbStats')
 *
 * @param {AxiosInstance} axiosClient
 * @param {string} route
 */
function toHaveCalledServiceGet(axiosClient, route) {
  const url = `${ENDPOINT_URL}/${route}`
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

expect.extend({ toEqualEjson, toHaveCalledServicePost, toHaveCalledServiceGet })

module.exports = {
  getDb
}
