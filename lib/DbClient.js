const { dbStatsApi, closeApi, listCollectionsApi, createCollectionApi } = require('./api/client')
const DbCollection = require('./DbCollection')

class DbClient {
  /**
   * @param {DbBase} db
   * @hideconstructor
   */
  constructor(db) {
    this.db = db
  }

  /**
   * Instantiates and returns a new DbClient object scoped to the configured namespace
   *
   * @static
   * @constructs
   * @param {DbBase} db
   * @returns {Promise<DbClient>}
   */
  static async init(db) {
    return new DbClient(db)
  }

  /**
   * Get the statistics for the scoped database
   *
   * @returns {Promise<Object>}
   * @throws {DbError}
   */
  async dbStats() {
    return dbStatsApi(this.db)
  }

  /**
   * List the collections in the scoped database according to the filter if provided
   *
   * @param {Object=} filter
   * @param {Object=} options
   * @returns {Promise<Object[]>}
   * @throws {DbError}
   */
  async listCollections(filter = {}, options = {}) {
    return listCollectionsApi(this.db, filter, options)
  }

  /**
   * Close the DB session
   *
   * @returns {Promise<void>}
   * @throws {DbError}
   */
  async close() {
    await closeApi(this.db)
    this.db.connected = false
  }

  /**
   * Gets the collection with the given name from the scoped database
   *
   * @param {string} name
   * @returns {DbCollection}
   */
  collection(name) {
    return DbCollection.init(name, this.db)
  }

  /**
   * Creates a new collection in the scoped database
   *
   * @param {string} name
   * @param {Object=} options
   * @returns {Promise<DbCollection>}
   * @throws {DbError}
   */
  async createCollection(name, options = {}) {
    await createCollectionApi(this.db, name, options)
    return DbCollection.init(name, this.db)
  }
}

module.exports = DbClient
