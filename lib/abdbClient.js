const { dbStatsApi, closeApi, listCollectionsApi, createCollectionApi } = require('./api/client')
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
   * Instantiates and returns a new AbdbClient object scoped to the configured namespace
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
   * Get the statistics for the scoped database
   *
   * @returns {Promise<Object>}
   * @throws {AbdbError}
   */
  async dbStats() {
    return dbStatsApi(this.abdb)
  }

  /**
   * List the collections in the scoped database according to the filter if provided
   *
   * @param {Object=} filter
   * @param {Object=} options
   * @returns {Promise<Object[]>}
   * @throws {AbdbError}
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
   * Gets the collection with the given name from the scoped database
   *
   * @param {string} name
   * @returns {AbdbCollection}
   */
  collection(name) {
    return AbdbCollection.init(name, this.abdb)
  }

  /**
   * Creates a new collection in the scoped database
   *
   * @param {string} name
   * @param {Object=} options
   * @returns {Promise<AbdbCollection>}
   * @throws {AbdbError}
   */
  async createCollection(name, options = {}) {
    await createCollectionApi(this.abdb, name, options)
    return AbdbCollection.init(name, this.abdb)
  }
}

module.exports = AbdbClient
