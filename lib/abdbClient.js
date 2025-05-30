const { dbStatsApi, closeApi, listCollectionsApi } = require('./api/client')
const AbdbCollection = require('./abdbCollection')

class AbdbClient {
  /**
   * @param {Abdb} abdb
   * @hideconstructor
   */
  constructor(abdb) {
    this.abdb = abdb
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
    return dbStatsApi(this.abdb)
  }

  /**
   * List the collections in a tenant's DB according to the filter if provided
   *
   * @param filter
   * @param options
   * @returns {Promise<Object[]>}
   */
  async listCollections(filter = {}, options = {}) {
    return listCollectionsApi(this.abdb, filter, options)
  }

  /**
   * Close the ABDB session
   *
   * @returns {Promise<void>}
   * @throws {AbdbError}
   */
  async close() {
    await closeApi(this.abdb)
    this.abdb.connected = false
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
