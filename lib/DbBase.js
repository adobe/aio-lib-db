require('dotenv/config')
const { default: axios } = require('axios')
const { CookieJar } = require('tough-cookie')
const { HttpCookieAgent, HttpsCookieAgent } = require('http-cookie-agent/http')
const { connectApi, pingApi, provisionStatusApi, provisionRequestApi } = require('./api/db')
const DbClient = require('./DbClient')
const { cleanParse } = require("../utils/ejsonHandler")
const DbError = require("./DbError")

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

class DbBase {
  /**
   * @param {string=} runtimeNamespace
   * @param {string=} runtimeAuth
   * @hideconstructor
   */
  constructor(runtimeNamespace = undefined, runtimeAuth = undefined) {
    this.runtimeAuth = runtimeAuth || process.env.AIO_runtime_auth
    if (!this.runtimeAuth) {
      throw new DbError('runtimeAuth is required in credentials or as AIO_runtime_auth in .env')
    }
    if (!/.+:.+/.test(this.runtimeAuth)) {
      throw new DbError("Invalid format for runtime auth, must be '<user>:<pass>'")
    }

    this.runtimeNamespace = runtimeNamespace || process.env.AIO_runtime_namespace
    if (!this.runtimeNamespace) {
      throw new DbError('runtimeNamespace is required in credentials or as AIO_runtime_namespace in .env')
    }

    this.connected = false
    this.axiosClientWithoutSession = axios.create()

    const jar = new CookieJar()
    this.axiosClientWithSession = axios.create({
      httpAgent: new HttpCookieAgent({ cookies: { jar } }),
      httpsAgent: new HttpsCookieAgent({ cookies: { jar } })
    })

    // Parse 20x results using EJSON instead of JSON
    this.axiosClientWithoutSession.interceptors.response.use(jsonToEjson)
    this.axiosClientWithSession.interceptors.response.use(jsonToEjson)
  }

  /**
   * Instantiates and returns a new DbBase object
   *
   * @static
   * @constructs
   * @param {string=} runtimeNamespace required here or as AIO_runtime_auth in .env
   * @param {string=} runtimeAuth required here or as AIO_runtime_namespace in .env
   * @returns {Promise<DbBase>} a new DbBase instance
   * @memberof DbBase
   */
  static async init(runtimeNamespace = undefined, runtimeAuth = undefined) {
    return new DbBase(runtimeNamespace, runtimeAuth)
  }

  /**
   * Send a request to provision a database scoped to the configured AIO runtime namespace
   *
   * @param {Object=} params
   * @param {string} params.region region to provision database (optional)
   * @returns {Promise<Object>}
   * @throws {DbError}
   * @memberof DbBase
   */
  async provisionRequest(params = {}) {
    return provisionRequestApi(this, params.region || 'default')
  }

  /**
   * Check the provisioning status for the configured AIO runtime namespace
   *
   * @returns {Promise<Object>}
   * @throws {DbError}
   * @memberof DbBase
   */
  async provisionStatus() {
    return provisionStatusApi(this)
  }

  /**
   * Initialize connection to App Builder Database Service
   *
   * @returns {Promise<DbClient>} a new DbClient instance
   * @throws {DbError}
   * @memberof DbBase
   */
  async connect() {
    await connectApi(this)
    this.connected = true
    return DbClient.init(this)
  }

  /**
   * General connectivity check with App Builder Database Service
   *
   * @returns {Promise<string>} ping results
   * @throws {DbError}
   * @memberof DbBase
   */
  async ping() {
    return await pingApi(this)
  }
}

module.exports = DbBase
