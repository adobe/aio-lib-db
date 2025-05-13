const { dbStatsApi, closeApi } = require('./api/client')
const AbdbCollection = require('./abdbCollection')

class AbdbClient {
  /**
   * @param {Abdb} abdb
   * @hideconstructor
   */
  constructor(abdb) {
    this.abdb = abdb;
    this.tenantId = abdb.tenantId;
    this.axiosClient = abdb.axiosClient;
  }

  /**
   * Instantiates and returns a new AbdbClient object
   *
   * @static
   * @constructs
   * @param {Abdb} abdb
   * @returns {Promise<AbdbClient>}
   */
  static async init(abdb) {
    return new AbdbClient(abdb)
  }

  /**
   * Get the statistics for the tenant's db
   *
   * @returns {Promise<Object>}
   * @throws {AbdbError}
   */
  async dbStats() {
    return dbStatsApi(this.tenantId, this.axiosClient);
  }

  /**
   * Close the ABDB session
   *
   * @returns {Promise<void>}
   * @throws {AbdbError}
   */
  async close() {
    await closeApi(this.tenantId, this.axiosClient);
    this.abdb.connected = false;
  }

  /**
   * Gets the collection with the given name from the tenant's db
   *
   * @param {string} name
   * @returns {AbdbCollection}
   */
  collection(name) {
    return AbdbCollection.init(name, this.abdb)
  }
}

module.exports = AbdbClient
