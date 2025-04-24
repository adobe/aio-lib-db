const { default: axios } = require('axios');
const { CookieJar } = require('tough-cookie');
const { HttpCookieAgent, HttpsCookieAgent } = require('http-cookie-agent/http');
const { dbStatsApi, closeApi } = require('./api/client')
const { connectApi, provisionApi, statusApi } = require('./api/abdb')
const { insertOneApi } = require('./api/collection')

class Abdb {
  constructor(credentials) {
    if (!credentials || !credentials["tenantId"]) {
      throw new Error("tenantId is required in credentials.");
    }
    this.tenantId = credentials.tenantId
    this.connected = false
    const jar = new CookieJar();
    this.axiosClient = axios.create({
      httpAgent: new HttpCookieAgent({ cookies: { jar } }),
      httpsAgent: new HttpsCookieAgent({ cookies: { jar } }),
    });
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
    const region = (params && params.region) ? params.region : 'default';
    return await provisionApi(region, this.axiosClient)
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
    const res = await statusApi(params.tenantId, this.axiosClient);
    return res;
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
    return AbdbClient.init(this);
  }
}

// TODO - get this into a separate file (not as easy as it sounds)
class AbdbClient {
  constructor(abdb) {
    this.abdb = abdb;
    this.tenantId = abdb.tenantId;
    this.axiosClient = abdb.axiosClient;
  }
  static init(abdb) {
    return new AbdbClient(abdb)
  }
  async dbStats() {
    return await dbStatsApi(this.tenantId, this.axiosClient);
  }
  async close() {
    await closeApi(this.tenantId, this.axiosClient);
    this.abdb.connected = false;
  }
  collection(name) {
    return AbdbCollection.init(name, this.abdb)
  }
}

// TODO - get this into another file
class AbdbCollection {
  constructor(name, abdb) {
    this.name = name;
    this.abdb = abdb;
    this.tenantId = abdb.tenantId;
    this.axiosClient = abdb.axiosClient;
  }
  static init(name, abdb) {
    return new AbdbCollection(name, abdb);
  }
  // minimal sample that needs improvement
  async insertOne(document, options) {
    return insertOneApi(this.tenantId, this.axiosClient, this.name, document, options);
  }
}

module.exports = Abdb
