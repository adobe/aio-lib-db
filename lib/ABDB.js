require('dotenv/config')
const { default: axios } = require('axios')
const { CookieJar } = require('tough-cookie')
const { HttpCookieAgent, HttpsCookieAgent } = require('http-cookie-agent/http')
const { connectApi, pingApi, provisionStatusApi, provisionRequestApi } = require('./api/abdb')
const AbdbClient = require('./abdbClient')
const { cleanParse } = require("../utils/ejsonHandler")
const AbdbError = require("./abdbError")

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
   * @param {string=} runtimeNamespace
   * @param {string=} runtimeAuth
   * @hideconstructor
   */
  constructor(runtimeNamespace = undefined, runtimeAuth = undefined) {
    this.runtimeAuth = runtimeAuth || process.env.RUNTIME_AUTH
    if (!this.runtimeAuth) {
      throw new AbdbError('runtimeAuth is required in credentials or as RUNTIME_AUTH in .env')
    }
    if (!/.+:.+/.test(this.runtimeAuth)) {
      throw new AbdbError("Invalid format for runtime auth, must be '<user>:<pass>'")
    }

    this.runtimeNamespace = runtimeNamespace || process.env.RUNTIME_NAMESPACE
    if (!this.runtimeNamespace) {
      throw new AbdbError('runtimeNamespace is required in credentials or as RUNTIME_NAMESPACE in .env')
    }

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
   * @param {string=} runtimeNamespace required here or as RUNTIME_AUTH in .env
   * @param {string=} runtimeAuth required here or as RUNTIME_NAMESPACE in .env
   * @returns {Promise<Abdb>} a new ABDB instance
   * @memberof Abdb
   */
  static async init(runtimeNamespace = undefined, runtimeAuth = undefined) {
    return new Abdb(runtimeNamespace, runtimeAuth)
  }

  /**
   * Send a request to provision a database scoped to the configured AIO runtime namespace
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
   * Check the provisioning status for the configured AIO runtime namespace
   *
   * @returns {Promise<Object>}
   * @throws {AbdbError}
   * @memberof Abdb
   */
  async provisionStatus() {
    return provisionStatusApi(this)
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
