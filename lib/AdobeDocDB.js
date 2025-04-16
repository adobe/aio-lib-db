const { getDbStats, connectToDb, closeConnection } = require('./api')
const { CookieJar } = require('node-fetch-cookies');
class AdobeDocDB {
  constructor (credentials) {
    if (!credentials || !credentials["tenantId"]) {
      throw new Error("tenantId is required in credentials.");
    }
    this.tenantId = credentials.tenantId
    this.connected = false
    this.cookieJar = new CookieJar() // Shared session jar
    console.log('AdobeDocDB instance initialized successfully.')
  }

  /**
   * Instantiates and returns a new AdobeDocDB object
   *
   * @static
   * @param {object} credentials initialization parameters
   * @param {string} credentials.tenantId tenant ID (required)
   * @returns {Promise<AdobeDocDB>} a new AdobeDocDB instance
   * @memberof AdobeDocDB
   */
  static async init (credentials) {
    return new AdobeDocDB(credentials)
  }

  /**
   * Connects to the Adobe Document DB.
   * Stores connection info and sets the connected flag.
   * @returns {Promise<void>}
   */
  async connect() {
    const connectionInfo = await connectToDb(this.tenantId, this.cookieJar)
    this.connected = true
    this.connectionInfo = connectionInfo
    
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
    return await getDbStats(this.tenantId, this.cookieJar)
  }

  /**
   * Closes the connection (soft-close only).
   * @returns {Promise<void>}
   */
  async close() {
    if(!this.connected) {
      throw new Error('Not connected. Call connect() first.')
    }
    await closeConnection(this.tenantId, this.cookieJar)
    this.connected = false
    console.log('Connection closed.')
  }
}

module.exports = AdobeDocDB