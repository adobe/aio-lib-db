const { default: axios } = require('axios');
const { CookieJar } = require('tough-cookie');
const { HttpCookieAgent, HttpsCookieAgent } = require('http-cookie-agent/http');
const { clientDbStats, clientClose } = require('./api/client')
const { dbConnect, dbProvision, dbStatus } = require('./api/db')


class ABDB {
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
    console.log('ABDB instance initialized successfully.')
  }

  /**
   * Instantiates and returns a new ABDB object
   *
   * @static
   * @param {object} credentials initialization parameters
   * @param {string} credentials.tenantId tenant ID (required)
   * @returns {Promise<ABDB>} a new ABDB instance
   * @memberof ABDB
   */
  static async init(credentials) {
    return new ABDB(credentials)
  }

  /**
   * Request to provision an ABDB Tenant.
   * 
   * @param {object} params 
   * @param {string} params.region region to provision tenant (optional)
   * @returns {Promise<Object>} the response to the request
   * @memberof ABDB
   */
  async provision(params) {
    const region = (params && params.region) ? params.region : 'default';
    return await dbProvision(region, this.axiosClient)
  }

  /**
   * Check the provisioning status of the specified tenant.
   * 
   * TODO - specified tenant to be replaced by AIO Project Workspace context.
   * 
   * @param {object} params 
   * @param {string} params.tenantId
   * @returns {Promise<Object>} the response to the request
   * @memberof ABDB
   */
  async status(params) {
    const res = await dbStatus(params.tenantId, this.axiosClient);
    return res;
  }

  /**
   * Connects to the Adobe Document DB.
   * Stores connection info and sets the connected flag.
   * @returns {Promise<void>}
   */
  async connect() {
    const connectionInfo = await dbConnect(this.tenantId, this.axiosClient)
    this.connected = true
    this.connectionInfo = connectionInfo

    // TODO - replace this with a dedicated client class
    return {
      dbStats: this.dbStats.bind(this),
      close: this.close.bind(this)
    }
  }

  /**
   * Fetches DB statistics. Requires active connection.
   * @returns {Promise<Object>} The database stats
   */
  async dbStats() {
    if (!this.connected) {
      throw new Error('Not connected. Call connect() first.')
    }
    return await clientDbStats(this.tenantId, this.axiosClient)
  }

  /**
   * Closes the connection (soft-close only).
   * @returns {Promise<void>}
   */
  async close() {
    if (!this.connected) {
      throw new Error('Not connected. Call connect() first.')
    }
    await clientClose(this.tenantId, this.axiosClient)
    this.connected = false
    console.log('Connection closed.')
  }
}

module.exports = ABDB
