const Cursor = require("../cursor")
const { apiPost } = require("../../utils/apiRequest")

/**
 * Make a post request to the abdb proxy service collection API and return the result
 *
 * @param {Abdb} abdb
 * @param {string} collectionName
 * @param {string} endpoint
 * @param {Object} params
 * @param {Object} options
 * @returns {Promise<*>}
 * @throws {AbdbError}
 */
async function postCollectionApi(abdb, collectionName, endpoint, params = {}, options = {}) {
  return await apiPost(abdb, `collection/${collectionName}/${endpoint}`, params, options)
}

/**
 * Insert a single document into the collection
 *
 * @param {Abdb} abdb
 * @param {string} collectionName
 * @param {Object} document
 * @param {Object=} options
 * @returns {Promise<Object>}
 * @throws {AbdbError}
 */
async function insertOne(abdb, collectionName, document, options = {}) {
  return await postCollectionApi(abdb, collectionName, 'insertOne', { document: document }, options)
}

/**
 * Inserts multiple documents into the collection
 *
 * @param {Abdb} abdb
 * @param {string} collectionName
 * @param {Object[]} documents
 * @param {Object=} options
 * @returns {Promise<Object>}
 * @throws {AbdbError}
 */
async function insertMany(abdb, collectionName, documents, options = {}) {
  return await postCollectionApi(abdb, collectionName, 'insertMany', { documents: documents }, options)
}

/**
 * Retrieve the first document that matches the filter
 *
 * @param {Abdb} abdb
 * @param {string} collectionName
 * @param {Object} filter
 * @param {Object=} options
 * @returns {Promise<Object>}
 * @throws {AbdbError}
 */
async function findOne(abdb, collectionName, filter, options = {}) {
  return await postCollectionApi(abdb, collectionName, 'findOne', { filter: filter }, options)
}

/**
 * Update and return the first document that matches the filter
 *
 * @param {Abdb} abdb
 * @param {string} collectionName
 * @param {Object} filter
 * @param {Object} update
 * @param {Object=} options
 * @returns {Promise<Object>}
 * @throws {AbdbError}
 */
async function findOneAndUpdate(abdb, collectionName, filter, update, options = {}) {
  return await postCollectionApi(abdb, collectionName, 'findOneAndUpdate', { filter: filter, update: update }, options)
}

/**
 * Replace and return the first document that matches the filter
 *
 * @param {Abdb} abdb
 * @param {string} collectionName
 * @param {Object} filter
 * @param {Object} replacement
 * @param {Object=} options
 * @returns {Promise<Object>}
 * @throws {AbdbError}
 */
async function findOneAndReplace(abdb, collectionName, filter, replacement, options = {}) {
  return await postCollectionApi(
    abdb,
    collectionName,
    'findOneAndReplace',
    { filter: filter, replacement: replacement },
    options
  )
}

/**
 * Delete and return the first document that matches the filter
 *
 * @param {Abdb} abdb
 * @param {string} collectionName
 * @param {Object} filter
 * @param {Object=} options
 * @returns {Promise<Object>}
 * @throws {AbdbError}
 */
async function findOneAndDelete(abdb, collectionName, filter, options = {}) {
  return await postCollectionApi(abdb, collectionName, 'findOneAndDelete', { filter: filter }, options)
}

/**
 * Update the first document that matches the filter
 *
 * @param {Abdb} abdb
 * @param {string} collectionName
 * @param {Object} filter
 * @param {Object} update
 * @param {Object=} options
 * @returns {Promise<Object>}
 * @throws {AbdbError}
 */
async function updateOne(abdb, collectionName, filter, update, options = {}) {
  return await postCollectionApi(abdb, collectionName, 'updateOne', { filter: filter, update: update }, options)
}

/**
 * Updates all documents that match the filter
 *
 * @param {Abdb} abdb
 * @param {string} collectionName
 * @param {Object} filter
 * @param {Object} update
 * @param {Object=} options
 * @returns {Promise<Object>}
 * @throws {AbdbError}
 */
async function updateMany(abdb, collectionName, filter, update, options = {}) {
  return await postCollectionApi(abdb, collectionName, 'updateMany', { filter: filter, update: update }, options)
}

/**
 * Replace the first document that matches the filter
 *
 * @param {Abdb} abdb
 * @param {string} collectionName
 * @param {Object} filter
 * @param {Object} replacement
 * @param {Object=} options
 * @returns {Promise<Object>}
 * @throws {AbdbError}
 */
async function replaceOne(abdb, collectionName, filter, replacement, options = {}) {
  return await postCollectionApi(
    abdb,
    collectionName,
    'replaceOne',
    { filter: filter, replacement: replacement },
    options
  )
}

/**
 * Delete the first document that matches the filter
 *
 * @param {Abdb} abdb
 * @param {string} collectionName
 * @param {Object} filter
 * @param {Object=} options
 * @returns {Promise<Object>}
 * @throws {AbdbError}
 */
async function deleteOne(abdb, collectionName, filter, options = {}) {
  return await postCollectionApi(abdb, collectionName, 'deleteOne', { filter: filter }, options)
}

/**
 * Deletes all documents that match the filter
 *
 * @param {Abdb} abdb
 * @param {string} collectionName
 * @param {Object} filter
 * @param {Object=} options
 * @returns {Promise<Object>}
 * @throws {AbdbError}
 */
async function deleteMany(abdb, collectionName, filter, options = {}) {
  return await postCollectionApi(abdb, collectionName, 'deleteMany', { filter: filter }, options)
}

/**
 * Execute multiple insert/update/delete commands in one operation
 *
 * @param {Abdb} abdb
 * @param {string} collectionName
 * @param {Object[]} operations
 * @param {Object=} options
 * @returns {Promise<Object>}
 * @throws {AbdbError}
 */
async function bulkWrite(abdb, collectionName, operations, options = {}) {
  return await postCollectionApi(abdb, collectionName, 'bulkWrite', { operations: operations }, options)
}

/**
 * Find all documents that match the filter
 *
 * @param {Abdb} abdb
 * @param {string} collectionName
 * @param {Object} filter
 * @param {Object=} options
 * @returns {Promise<Object>}
 * @throws {AbdbError}
 */
async function find(abdb, collectionName, filter, options = {}) {
  const data = await postCollectionApi(abdb, collectionName, 'find', { filter: filter }, options)
  return new Cursor(
    abdb,
    { type: 'FIND', filter: filter },
    collectionName,
    data.cursor.id,
    data.cursor['firstBatch'],
    options
  )
}

/**
 * Executes an aggregation pipeline over the documents in a collection
 *
 * @param {Abdb} abdb
 * @param {string} collectionName
 * @param {Object[]} pipeline
 * @param {Object=} options
 * @returns {Promise<Cursor>}
 * @throws {AbdbError}
 */
async function aggregate(abdb, collectionName, pipeline, options = {}) {
  const data = await postCollectionApi(abdb, collectionName, 'aggregate', { pipeline: pipeline }, options)
  return new Cursor(
    abdb,
    { type: 'AGGREGATE', pipeline: pipeline },
    collectionName,
    data.cursor.id,
    data.cursor['firstBatch'],
    options
  )
}

/**
 * Get the list of indexes from the collection
 *
 * @param {Abdb} abdb
 * @param {string} collectionName
 * @returns {Promise<Object[]>}
 * @throws {AbdbError}
 */
async function getIndexes(abdb, collectionName) {
  return await postCollectionApi(abdb, collectionName, 'getIndexes')
}

/**
 * Create an index with the provided specification
 *
 * @param {Abdb} abdb
 * @param {string} collectionName
 * @param {Object} specification
 * @param {Object=} options
 * @returns {Promise<Object>}
 * @throws {AbdbError}
 */
async function createIndex(abdb, collectionName, specification, options = {}) {
  return await postCollectionApi(abdb, collectionName, 'createIndex', { specification: specification }, options)
}

/**
 * Drop the index with the provided name
 *
 * @param {Abdb} abdb
 * @param {string} collectionName
 * @param {string} index
 * @param {Object=} options
 * @returns {Promise<Object>}
 * @throws {AbdbError}
 */
async function dropIndex(abdb, collectionName, index, options = {}) {
  return await postCollectionApi(abdb, collectionName, 'dropIndex', { index: index }, options)
}

/**
 * Hide an index
 *
 * @param {Abdb} abdb
 * @param {string} collectionName
 * @param {string} index
 * @returns {Promise<Object>}
 * @throws {AbdbError}
 */
async function hideIndex(abdb, collectionName, index) {
  return await postCollectionApi(abdb, collectionName, 'hideIndex', { index: index })
}

/**
 * Unhide an index
 *
 * @param {Abdb} abdb
 * @param {string} collectionName
 * @param {string} index
 * @returns {Promise<Object>}
 * @throws {AbdbError}
 */
async function unhideIndex(abdb, collectionName, index) {
  return await postCollectionApi(abdb, collectionName, 'unhideIndex', { index: index })
}

/**
 * Find all distinct values for a field, optionally applying a filter
 *
 * @param {Abdb} abdb
 * @param {string} collectionName
 * @param {(Object|string)} field
 * @param {Object=} filter
 * @param {Object=} options
 * @returns {Promise<*[]>}
 * @throws {AbdbError}
 */
async function distinct(abdb, collectionName, field, filter = {}, options = {}) {
  return await postCollectionApi(abdb, collectionName, 'distinct', { field: field, filter: filter }, options)
}

/**
 * Count the number of documents in a collection, optionally applying a filter
 *
 * @param {Abdb} abdb
 * @param {string} collectionName
 * @param {Object=} filter
 * @param {Object=} options
 * @returns {Promise<number>}
 * @throws {AbdbError}
 */
async function countDocuments(abdb, collectionName, filter = {}, options = {}) {
  return await postCollectionApi(abdb, collectionName, 'countDocuments', { filter: filter }, options)
}

/**
 * Estimates the number of documents in a collection based on collection metadata
 *
 * @param {Abdb} abdb
 * @param {string} collectionName
 * @param {Object=} options
 * @returns {Promise<number>}
 * @throws {AbdbError}
 */
async function estimatedDocumentCount(abdb, collectionName, options = {}) {
  return await postCollectionApi(abdb, collectionName, 'estimatedDocumentCount', {}, options)
}

module.exports = {
  insertOneApi: insertOne,
  insertManyApi: insertMany,
  findOneApi: findOne,
  findOneAndUpdateApi: findOneAndUpdate,
  findOneAndReplaceApi: findOneAndReplace,
  findOneAndDeleteApi: findOneAndDelete,
  updateOneApi: updateOne,
  updateManyApi: updateMany,
  replaceOneApi: replaceOne,
  deleteOneApi: deleteOne,
  deleteManyApi: deleteMany,
  bulkWriteApi: bulkWrite,
  findApi: find,
  aggregateApi: aggregate,
  getIndexesApi: getIndexes,
  createIndexApi: createIndex,
  dropIndexApi: dropIndex,
  hideIndexApi: hideIndex,
  unhideIndexApi: unhideIndex,
  distinctApi: distinct,
  countDocumentsApi: countDocuments,
  estimatedDocumentCountApi: estimatedDocumentCount
}
