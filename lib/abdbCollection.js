const {
  insertOneApi, findOneApi, updateOneApi, replaceOneApi, deleteOneApi, findApi, aggregateApi, bulkWriteApi,
  deleteManyApi, updateManyApi, insertManyApi, findOneAndUpdateApi, findOneAndReplaceApi, findOneAndDeleteApi,
  createIndexApi, dropIndexApi, hideIndexApi, unhideIndexApi, getIndexesApi
} = require('./api/collection')

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
   * Insert multiple documents into the collection
   *
   * @param {Object[]} documents
   * @param {Object=} options
   * @returns {Promise<Object>}
   * @throws {AbdbError}
   */
  async insertMany(documents, options = {}) {
    return insertManyApi(this.tenantId, this.axiosClient, this.name, documents, options)
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
   * Find all documents that match the filter
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
   * Update and return the first document that matches the filter
   *
   * @param {Object} filter
   * @param {Object} update
   * @param {Object=} options
   * @returns {Promise<Object>}
   * @throws {AbdbError}
   */
  async findOneAndUpdate(filter, update, options = {}) {
    return findOneAndUpdateApi(this.tenantId, this.axiosClient, this.name, filter, update, options)
  }

  /**
   * Replace and return the first document that matches the filter
   *
   * @param {Object} filter
   * @param {Object} replacement
   * @param {Object=} options
   * @returns {Promise<Object>}
   * @throws {AbdbError}
   */
  async findOneAndReplace(filter, replacement, options = {}) {
    return findOneAndReplaceApi(this.tenantId, this.axiosClient, this.name, filter, replacement, options)
  }

  /**
   * Delete and return the first document that matches the filter
   *
   * @param {Object} filter
   * @param {Object=} options
   * @returns {Promise<Object>}
   * @throws {AbdbError}
   */
  async findOneAndDelete(filter, options = {}) {
    return findOneAndDeleteApi(this.tenantId, this.axiosClient, this.name, filter, options)
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
   * Update all documents that match a filter
   *
   * @param {Object} filter
   * @param {Object} update
   * @param {Object=} options
   * @returns {Promise<Object>}
   * @throws {AbdbError}
   */
  async updateMany(filter, update, options = {}) {
    return updateManyApi(this.tenantId, this.axiosClient, this.name, filter, update, options)
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
   * Delete all documents that match a filter
   *
   * @param {Object} filter
   * @param {Object=} options
   * @returns {Promise<Object>}
   * @throws {AbdbError}
   */
  async deleteMany(filter, options = {}) {
    return deleteManyApi(this.tenantId, this.axiosClient, this.name, filter, options)
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

  /**
   * Execute multiple insert/update/delete commands in one operation
   *
   * @param {Object[]} operations
   * @param {Object=} options
   * @returns {Promise<Object>}
   * @throws {AbdbError}
   */
  async bulkWrite(operations, options = {}) {
    return bulkWriteApi(this.tenantId, this.axiosClient, this.name, operations, options)
  }

  /**
   * Gets the list of indexes in the collection
   *
   * @returns {Promise<Object[]>}
   * @throws {AbdbError}
   */
  async getIndexes() {
    return getIndexesApi(this.tenantId, this.axiosClient, this.name)
  }

  /**
   * Create an index with the provided specification
   *
   * @param {Object} specification
   * @param {Object=} options
   * @returns {Promise<String>} The name of the created index
   * @throws {AbdbError}
   */
  async createIndex(specification, options = {}) {
    return createIndexApi(this.tenantId, this.axiosClient, this.name, specification, options)
  }

  /**
   * Drops the index with the given name
   *
   * @param {string} index
   * @param {Object=} options
   * @returns {Promise<Object>}
   * @throws {AbdbError}
   */
  async dropIndex(index, options = {}) {
    return dropIndexApi(this.tenantId, this.axiosClient, this.name, index, options)
  }

  /**
   * Hides the index with the given name
   *
   * @param {string} index
   * @returns {Promise<Object>}
   * @throws {AbdbError}
   */
  async hideIndex(index) {
    return hideIndexApi(this.tenantId, this.axiosClient, this.name, index)
  }

  /**
   * Unhides the index with the given name
   *
   * @param {string} index
   * @returns {Promise<Object>}
   * @throws {AbdbError}
   */
  async unhideIndex(index) {
    return unhideIndexApi(this.tenantId, this.axiosClient, this.name, index)
  }
}

module.exports = AbdbCollection
