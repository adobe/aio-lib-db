/*
Copyright 2025 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/
const {
  insertOneApi, findOneApi, updateOneApi, replaceOneApi, deleteOneApi, findApi, aggregateApi, bulkWriteApi,
  deleteManyApi, updateManyApi, insertManyApi, findOneAndUpdateApi, findOneAndReplaceApi, findOneAndDeleteApi,
  createIndexApi, dropIndexApi, getIndexesApi, distinctApi, countDocumentsApi, estimatedDocumentCountApi, dropApi,
  renameCollectionApi, statsApi, findArrayApi
} = require('./api/collection')

class DbCollection {
  /**
   * @param {string} name
   * @param {DbBase} db
   * @hideconstructor
   */
  constructor(name, db) {
    this.name = name
    this.db = db
  }

  /**
   * Instantiates and returns a new DbCollection object
   *
   * @static
   * @constructs
   * @param {string} name
   * @param {DbBase} db
   * @returns {DbCollection}
   */
  static init(name, db) {
    return new DbCollection(name, db)
  }

  /**
   * Inserts a single document into the collection
   *
   * @param {Object} document
   * @param {Object=} options
   * @returns {Promise<Object>}
   * @throws {DbError}
   */
  async insertOne(document, options = {}) {
    return insertOneApi(this.db, this.name, document, options)
  }

  /**
   * Insert multiple documents into the collection
   *
   * @param {Object[]} documents
   * @param {Object=} options
   * @returns {Promise<Object>}
   * @throws {DbError}
   */
  async insertMany(documents, options = {}) {
    return insertManyApi(this.db, this.name, documents, options)
  }

  /**
   * Finds the first document matching the filter
   *
   * @param {Object} filter
   * @param {Object=} options
   * @returns {Promise<Object>}
   * @throws {DbError}
   */
  async findOne(filter, options = {}) {
    return findOneApi(this.db, this.name, filter, options)
  }

  /**
   * Find all documents that match the filter
   *
   * @param {Object=} filter
   * @param {Object=} options
   * @returns {FindCursor}
   * @throws {DbError}
   */
  find(filter = {}, options = {}) {
    return findApi(this.db, this.name, filter, options)
  }

  /**
   * Update and return the first document that matches the filter
   *
   * @param {Object} filter
   * @param {Object} update
   * @param {Object=} options
   * @returns {Promise<Object>}
   * @throws {DbError}
   */
  async findOneAndUpdate(filter, update, options = {}) {
    return findOneAndUpdateApi(this.db, this.name, filter, update, options)
  }

  /**
   * Replace and return the first document that matches the filter
   *
   * @param {Object} filter
   * @param {Object} replacement
   * @param {Object=} options
   * @returns {Promise<Object>}
   * @throws {DbError}
   */
  async findOneAndReplace(filter, replacement, options = {}) {
    return findOneAndReplaceApi(this.db, this.name, filter, replacement, options)
  }

  /**
   * Delete and return the first document that matches the filter
   *
   * @param {Object} filter
   * @param {Object=} options
   * @returns {Promise<Object>}
   * @throws {DbError}
   */
  async findOneAndDelete(filter, options = {}) {
    return findOneAndDeleteApi(this.db, this.name, filter, options)
  }

  /**
   * Finds the first batch of documents that match the filter and return them as an array.
   * Does not allow retrieving more than one batch of results.
   *
   * @param {Object=} filter
   * @param {Object=} options
   * @returns {Promise<Object[]>}
   */
  async findArray(filter = {}, options = {}) {
    return findArrayApi(this.db, this.name, filter, options)
  }

  /**
   * Updates the first document that matches the filter
   *
   * @param {Object} filter
   * @param {Object} update
   * @param {Object=} options
   * @returns {Promise<Object>}
   * @throws {DbError}
   */
  async updateOne(filter, update, options = {}) {
    return updateOneApi(this.db, this.name, filter, update, options)
  }

  /**
   * Update all documents that match a filter
   *
   * @param {Object} filter
   * @param {Object} update
   * @param {Object=} options
   * @returns {Promise<Object>}
   * @throws {DbError}
   */
  async updateMany(filter, update, options = {}) {
    return updateManyApi(this.db, this.name, filter, update, options)
  }

  /**
   * Replaces the first document that matches the filter
   *
   * @param {Object} filter
   * @param {Object} replacement
   * @param {Object=} options
   * @returns {Promise<Object>}
   * @throws {DbError}
   */
  async replaceOne(filter, replacement, options = {}) {
    return replaceOneApi(this.db, this.name, filter, replacement, options)
  }

  /**
   * Deletes the first document that matches the filter
   *
   * @param {Object} filter
   * @param {Object=} options
   * @returns {Promise<Object>}
   * @throws {DbError}
   */
  async deleteOne(filter, options = {}) {
    return deleteOneApi(this.db, this.name, filter, options)
  }

  /**
   * Delete all documents that match a filter
   *
   * @param {Object} filter
   * @param {Object=} options
   * @returns {Promise<Object>}
   * @throws {DbError}
   */
  async deleteMany(filter, options = {}) {
    return deleteManyApi(this.db, this.name, filter, options)
  }

  /**
   * Executes an aggregation pipeline over the documents in a collection
   *
   * @param {Object[]=} pipeline
   * @param {Object=} options
   * @returns {AggregateCursor}
   * @throws {DbError}
   */
  aggregate(pipeline = [], options = {}) {
    return aggregateApi(this.db, this.name, pipeline, options)
  }

  /**
   * Execute multiple insert/update/delete commands in one operation
   *
   * @param {Object[]} operations
   * @param {Object=} options
   * @returns {Promise<Object>}
   * @throws {DbError}
   */
  async bulkWrite(operations, options = {}) {
    return bulkWriteApi(this.db, this.name, operations, options)
  }

  /**
   * Gets the list of indexes in the collection
   *
   * @returns {Promise<Object[]>}
   * @throws {DbError}
   */
  async getIndexes() {
    return getIndexesApi(this.db, this.name)
  }

  /**
   * Create an index with the provided specification
   *
   * @param {Object} specification
   * @param {Object=} options
   * @returns {Promise<String>} The name of the created index
   * @throws {DbError}
   */
  async createIndex(specification, options = {}) {
    return createIndexApi(this.db, this.name, specification, options)
  }

  /**
   * Drops the index with the given name
   *
   * @param {string} index
   * @param {Object=} options
   * @returns {Promise<Object>}
   * @throws {DbError}
   */
  async dropIndex(index, options = {}) {
    return dropIndexApi(this.db, this.name, index, options)
  }

  /**
   * Find all distinct values for a field, optionally applying a filter
   *
   * @param {(Object|string)} field
   * @param {Object=} filter
   * @param {Object=} options
   * @returns {Promise<*[]>}
   * @throws {DbError}
   */
  async distinct(field, filter = {}, options = {}) {
    return distinctApi(this.db, this.name, field, filter, options)
  }

  /**
   * Count the number of documents, optionally applying a filter
   *
   * @param {Object=} filter
   * @param {Object=} options
   * @returns {Promise<number>}
   * @throws {DbError}
   */
  async countDocuments(filter = {}, options = {}) {
    return countDocumentsApi(this.db, this.name, filter, options)
  }

  /**
   * @deprecated
   * @see countDocuments
   *
   * @param {Object=} filter
   * @param {Object=} options
   * @returns {Promise<number>}
   * @throws {DbError}
   */
  async count(filter = {}, options = {}) {
    return this.countDocuments(filter, options)
  }

  /**
   * Estimates the number of documents based on collection metadata
   *
   * @param {Object=} options
   * @returns {Promise<number>}
   * @throws {DbError}
   */
  async estimatedDocumentCount(options = {}) {
    return estimatedDocumentCountApi(this.db, this.name, options)
  }

  /**
   * Drop this collection from the database
   *
   * @param {Object=} options
   * @returns {Promise<void>}
   * @throws {DbError}
   */
  async drop(options = {}) {
    return dropApi(this.db, this.name, options)
  }

  /**
   * Rename this collection
   *
   * @param {string} newCollectionName
   * @param {Object=} options
   * @returns {Promise<void>}
   * @throws {DbError}
   */
  async renameCollection(newCollectionName, options = {}) {
    await renameCollectionApi(this.db, this.name, newCollectionName, options)
    this.name = newCollectionName
  }

  /**
   * Get collection statistics
   *
   * @param {Object=} options
   * @returns {Promise<Object>}
   * @throws {DbError}
   */
  async stats(options = {}) {
    return statsApi(this.db, this.name, options)
  }
}

module.exports = DbCollection
