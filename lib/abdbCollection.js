const { insertOneApi, findOneApi, updateOneApi, replaceOneApi, deleteOneApi, findApi, aggregateApi } = require(
  './api/collection')

class AbdbCollection {
  /**
   * @param {string} name
   * @param {Abdb} abdb
   * @hideconstructor
   */
  constructor(name, abdb) {
    this.name = name
    this.abdb = abdb
    this.tenantId = abdb.tenantId
    this.axiosClient = abdb.axiosClient
  }

  /**
   * Instantiates and returns a new AbdbCollection object
   *
   * @static
   * @constructs
   * @param {string} name
   * @param {Abdb} abdb
   * @returns {AbdbCollection}
   */
  static init(name, abdb) {
    return new AbdbCollection(name, abdb)
  }

  /**
   * Inserts a single document into the collection
   *
   * @param {Object} document
   * @param {Object=} options
   * @returns {Promise<Object>}
   * @throws {AbdbError}
   */
  async insertOne(document, options = {}) {
    return insertOneApi(this.tenantId, this.axiosClient, this.name, document, options)
  }

  /**
   * Finds the first document matching the query
   *
   * @param {Object} query
   * @param {Object=} options
   * @returns {Promise<Object>}
   * @throws {AbdbError}
   */
  async findOne(query, options = {}) {
    return findOneApi(this.tenantId, this.axiosClient, this.name, query, options)
  }

  /**
   * Updates the first document that matches the filter
   *
   * @param {Object} filter
   * @param {Object} update
   * @param {Object=} options
   * @returns {Promise<Object>}
   * @throws {AbdbError}
   */
  async updateOne(filter, update, options = {}) {
    return updateOneApi(this.tenantId, this.axiosClient, this.name, filter, update, options)
  }

  /**
   * Replaces the first document that matches the filter
   *
   * @param {Object} filter
   * @param {Object} replacement
   * @param {Object=} options
   * @returns {Promise<Object>}
   * @throws {AbdbError}
   */
  async replaceOne(filter, replacement, options = {}) {
    return replaceOneApi(this.tenantId, this.axiosClient, this.name, filter, replacement, options)
  }

  /**
   * Deletes the first document that matches the filter
   *
   * @param {Object} filter
   * @param {Object=} options
   * @returns {Promise<Object>}
   * @throws {AbdbError}
   */
  async deleteOne(filter, options = {}) {
    return deleteOneApi(this.tenantId, this.axiosClient, this.name, filter, options)
  }

  /**
   * Finds all documents that match the filter
   *
   * @param {Object} filter
   * @param {Object=} options
   * @returns {Promise<Cursor>}
   * @throws {AbdbError}
   */
  async find(filter, options = {}) {
    return findApi(this.tenantId, this.axiosClient, this.name, filter, options)
  }

  /**
   * Executes an aggregation pipeline over the documents in a collection
   *
   * @param {Object[]} pipeline
   * @param {Object=} options
   * @returns {Promise<Cursor>}
   * @throws {AbdbError}
   */
  async aggregate(pipeline, options = {}) {
    return aggregateApi(this.tenantId, this.axiosClient, this.name, pipeline, options)
  }
}

module.exports = AbdbCollection
