const {
  insertOneApi, findOneApi, updateOneApi, replaceOneApi, deleteOneApi, findApi, aggregateApi, bulkWriteApi,
  deleteManyApi, updateManyApi, insertManyApi
} = require('./api/collection')

class AbdbCollection {
  constructor(name, abdb) {
    this.name = name
    this.abdb = abdb
    this.tenantId = abdb.tenantId
    this.axiosClient = abdb.axiosClient
  }

  static init(name, abdb) {
    return new AbdbCollection(name, abdb)
  }

  // minimal sample that needs improvement
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

  async findOne(query, options = {}) {
    return findOneApi(this.tenantId, this.axiosClient, this.name, query, options)
  }

  /**
   * Find all documents that match a filter
   *
   * @param {Object} filter
   * @param {Object=} options
   * @returns {Promise<Cursor>}
   * @throws {AbdbError}
   */
  async find(filter, options = {}) {
    return findApi(this.tenantId, this.axiosClient, this.name, filter, options)
  }

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

  async replaceOne(filter, replacement, options = {}) {
    return replaceOneApi(this.tenantId, this.axiosClient, this.name, filter, replacement, options)
  }

  async deleteOne(filter, options = {}) {
    return deleteOneApi(this.tenantId, this.axiosClient, this.name, filter, options)
  }

  /**
   * Delete all documents that match a filter
   *
   * @param {Object} filter
   * @param {Object} options
   * @returns {Promise<Object>}
   * @throws {AbdbError}
   */
  async deleteMany(filter, options = {}) {
    return deleteManyApi(this.tenantId, this.axiosClient, this.name, filter, options)
  }

  async aggregate(pipeline, options = {}) {
    return aggregateApi(this.tenantId, this.axiosClient, this.name, pipeline, options)
  }

  /**
   * Execute multiple insert/update/delete commands in one operation
   *
   * @param {Object} operations
   * @param {Object} options
   * @returns {Promise<Object>}
   * @throws {AbdbError}
   */
  async bulkWrite(operations, options = {}) {
    return bulkWriteApi(this.tenantId, this.axiosClient, this.name, operations, options)
  }
}

module.exports = AbdbCollection
