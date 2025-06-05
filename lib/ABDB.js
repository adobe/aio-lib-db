require('dotenv/config')
const { default: axios } = require('axios')
const { CookieJar } = require('tough-cookie')
const { HttpCookieAgent, HttpsCookieAgent } = require('http-cookie-agent/http')
const { connectApi, provisionApi, statusApi, pingApi, provisionStatusApi, provisionRequestApi } = require('./api/abdb')
const AbdbClient = require('./abdbClient')
const { cleanParse } = require("../utils/ejsonHandler")

/**
 * Use EJSON instead of JSON and clean primitive values
 *
 * @param {AxiosResponse} response
 * @returns {AxiosResponse}
 */
function jsonToEjson(response) {
  if (/^application\/json/.test(response.headers["content-type"])) {
    response.data = cleanParse(response.data)
  }
  return response
}

class Abdb {
  /**
   * @param {Object<{"tenantId": string, "auth": string, "runtimeNamespace": string}>} credentials
   * @hideconstructor
   */
  constructor(credentials) {
    if (!credentials || !credentials["tenantId"]) {
      throw new Error("tenantId is required in credentials.")
    }
    this.tenantId = credentials.tenantId // TODO: Remove tenancy in favor of runtime, see CEXT-4671

    if (!credentials['auth']) {
      throw new Error('auth is required credentials')
    }
    if (!/.+:.+/.test(credentials['auth'])) {
      throw new Error("Invalid format for auth, must be '<user>:<pass>'")
    }
    this.auth = credentials['auth']

    if (!credentials['runtimeNamespace']) {
      throw new Error('runtimeNamespace in credentials is required')
    }
    this.runtimeNamespace = credentials.runtimeNamespace

    this.connected = false
    const jar = new CookieJar()
    this.axiosClient = axios.create({
      httpAgent: new HttpCookieAgent({ cookies: { jar } }),
      httpsAgent: new HttpsCookieAgent({ cookies: { jar } })
    })

    // Parse 20x results using EJSON instead of JSON
    this.axiosClient.interceptors.response.use(jsonToEjson)

    console.log('Abdb instance initialized successfully.')
  }

  /**
   * Instantiates and returns a new Abdb object
   *
   * @static
   * @constructs
   * @param {Object<{"tenantId": string, "runtimeNamespace": string=}>} credentials initialization parameters
   * @param {string} credentials.tenantId required
   * @param {string=} credentials.runtimeNamespace required either here or as RUNTIME_NAMESPACE in .env
   * @returns {Promise<Abdb>} a new ABDB instance
   * @memberof Abdb
   */
  static async init(credentials) {
    return new Abdb(credentials)
  }

  /**
   * Request to provision an ABDB database
   *
   * @param {Object=} params
   * @param {string} params.region region to provision database (optional)
   * @returns {Promise<Object>}
   * @throws {AbdbError}
   * @memberof Abdb
   */
  async provisionRequest(params = {}) {
    return provisionRequestApi(this, params.region || 'default')
  }

  /**
   * Check the database provisioning status
   *
   * @returns {Promise<Object>}
   * @throws {AbdbError}
   * @memberof Abdb
   */
  async provisionStatus() {
    return provisionStatusApi(this)
  }

  /**
   * Request to provision an ABDB Tenant.
   *
   * TODO: Remove in favor of provisionRequest as part of CEXT-4671
   *
   * @param {Object} params
   * @param {string} params.region region to provision tenant (optional)
   * @returns {Promise<Object>} the response to the request
   * @throws {AbdbError}
   * @memberof Abdb
   */
  async provision(params) {
    const region = (params && params.region) ? params.region : 'default'
    return provisionApi(region, this)
  }

  /**
   * Check the provisioning status of the specified tenant.
   *
   * TODO: Remove in favor of provisionStatus as part of CEXT-4671
   *
   * @param {Object} params
   * @param {string} params.tenantId
   * @returns {Promise<boolean>} the response to the request
   * @throws {AbdbError}
   * @memberof Abdb
   */
  async status(params) {
    return statusApi(params.tenantId, this)
  }

  /**
   * Initialize connection to ABDB Proxy Service
   *
   * @returns {Promise<AbdbClient>} a new AbdbClient instance
   * @throws {AbdbError}
   * @memberof Abdb
   */
  async connect() {
    await connectApi(this)
    this.connected = true
    return AbdbClient.init(this)
  }

  /**
   * General connectivity check with ABDB
   *
   * @returns {Promise<string>} ping results
   * @throws {AbdbError}
   * @memberof Abdb
   */
  async ping() {
    return await pingApi(this)
  }
}

module.exports = Abdb
