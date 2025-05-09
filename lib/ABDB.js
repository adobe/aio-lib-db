const { default: axios } = require('axios')
const { CookieJar } = require('tough-cookie')
const { HttpCookieAgent, HttpsCookieAgent } = require('http-cookie-agent/http')
const { connectApi, provisionApi, statusApi } = require('./api/abdb')
const AbdbClient = require('./abdbClient')
const { cleanParse } = require("../utils/ejsonHandler")

// Use EJSON instead of JSON and clean primitive values
function jsonToEjson(response) {
  if (/^application\/json/.test(response.headers["content-type"])) {
    response.data = cleanParse(response.data)
  }
  return response
}

class Abdb {
  constructor(credentials) {
    if (!credentials || !credentials["tenantId"]) {
      throw new Error("tenantId is required in credentials.")
    }
    this.tenantId = credentials.tenantId
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
   * @param {object} credentials initialization parameters
   * @param {string} credentials.tenantId tenant ID (required)
   * @returns {Promise<Abdb>} a new ABDB instance
   * @memberof Abdb
   */
  static async init(credentials) {
    return new Abdb(credentials)
  }

  /**
   * Request to provision an ABDB Tenant.
   *
   * @param {object} params
   * @param {string} params.region region to provision tenant (optional)
   * @returns {Promise<Object>} the response to the request
   * @memberof Abdb
   */
  async provision(params) {
    const region = (params && params.region) ? params.region : 'default'
    return provisionApi(region, this.axiosClient)
  }

  /**
   * Check the provisioning status of the specified tenant.
   *
   * TODO - specified tenant to be replaced by AIO Project Workspace context.
   *
   * @param {object} params
   * @param {string} params.tenantId
   * @returns {Promise<Object>} the response to the request
   * @memberof Abdb
   */
  async status(params) {
    return statusApi(params.tenantId, this.axiosClient)
  }

  /**
   * Initialize connection to ABDB Proxy Service
   *
   * @returns {Promise<AbdbClient>} a new AbdbClient instance
   */
  async connect() {
    const connectionInfo = await connectApi(this.tenantId, this.axiosClient)
    this.connected = true
    this.connectionInfo = connectionInfo
    return AbdbClient.init(this)
  }
}

module.exports = Abdb
