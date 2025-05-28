const {
  insertOneApi, findOneApi, updateOneApi, replaceOneApi, deleteOneApi, findApi, aggregateApi, bulkWriteApi,
  deleteManyApi, updateManyApi, insertManyApi, findOneAndUpdateApi, findOneAndReplaceApi, findOneAndDeleteApi,
  createIndexApi, dropIndexApi, hideIndexApi, unhideIndexApi, getIndexesApi, distinctApi, countDocumentsApi,
  estimatedDocumentCountApi
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
    return insertOneApi(this.abdb, this.name, document, options)
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
    return insertManyApi(this.abdb, this.name, documents, options)
  }

  /**
   * Finds the first document matching the filter
   *
   * @param {Object} filter
   * @param {Object=} options
   * @returns {Promise<Object>}
   * @throws {AbdbError}
   */
  async findOne(filter, options = {}) {
    return findOneApi(this.abdb, this.name, filter, options)
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
    return findApi(this.abdb, this.name, filter, options)
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
    return findOneAndUpdateApi(this.abdb, this.name, filter, update, options)
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
    return findOneAndReplaceApi(this.abdb, this.name, filter, replacement, options)
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
    return findOneAndDeleteApi(this.abdb, this.name, filter, options)
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
    return updateOneApi(this.abdb, this.name, filter, update, options)
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
    return updateManyApi(this.abdb, this.name, filter, update, options)
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
    return replaceOneApi(this.abdb, this.name, filter, replacement, options)
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
    return deleteOneApi(this.abdb, this.name, filter, options)
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
    return deleteManyApi(this.abdb, this.name, filter, options)
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
    return aggregateApi(this.abdb, this.name, pipeline, options)
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
    return bulkWriteApi(this.abdb, this.name, operations, options)
  }

  /**
   * Gets the list of indexes in the collection
   *
   * @returns {Promise<Object[]>}
   * @throws {AbdbError}
   */
  async getIndexes() {
    return getIndexesApi(this.abdb, this.name)
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
    return createIndexApi(this.abdb, this.name, specification, options)
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
    return dropIndexApi(this.abdb, this.name, index, options)
  }

  /**
   * Hides the index with the given name
   *
   * @param {string} index
   * @returns {Promise<Object>}
   * @throws {AbdbError}
   */
  async hideIndex(index) {
    return hideIndexApi(this.abdb, this.name, index)
  }

  /**
   * Unhides the index with the given name
   *
   * @param {string} index
   * @returns {Promise<Object>}
   * @throws {AbdbError}
   */
  async unhideIndex(index) {
    return unhideIndexApi(this.abdb, this.name, index)
  }

  /**
   * Find all distinct values for a field, optionally applying a filter
   *
   * @param {(Object|string)} field
   * @param {Object=} filter
   * @param {Object=} options
   * @returns {Promise<*[]>}
   * @throws {AbdbError}
   */
  async distinct(field, filter = {}, options = {}) {
    return distinctApi(this.abdb, this.name, field, filter, options)
  }

  /**
   * Count the number of documents, optionally applying a filter
   *
   * @param {Object=} filter
   * @param {Object=} options
   * @returns {Promise<number>}
   * @throws {AbdbError}
   */
  async countDocuments(filter = {}, options = {}) {
    return countDocumentsApi(this.abdb, this.name, filter, options)
  }

  /**
   * @deprecated
   * @see countDocuments
   *
   * @param {Object=} filter
   * @param {Object=} options
   * @returns {Promise<number>}
   * @throws {AbdbError}
   */
  async count(filter = {}, options = {}) {
    return this.countDocuments(filter, options)
  }

  /**
   * Estimates the number of documents based on collection metadata
   *
   * @param {Object=} options
   * @returns {Promise<number>}
   * @throws {AbdbError}
   */
  async estimatedDocumentCount(options = {}) {
    return estimatedDocumentCountApi(this.abdb, this.name, options)
  }
}

module.exports = AbdbCollection
