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
const { apiPost } = require("../../utils/apiRequest")
const FindCursor = require("../FindCursor")
const AggregateCursor = require("../AggregateCursor")

/**
 * Make a post request to the App Builder Database Service collection API and return the result
 *
 * @param {DbBase} db
 * @param {string} collectionName
 * @param {string} endpoint
 * @param {Object=} params
 * @param {Object=} options
 * @returns {Promise<*>}
 * @throws {DbError}
 */
async function postCollectionApi(db, collectionName, endpoint, params = {}, options = {}) {
  return await apiPost(db, `collection/${collectionName}/${endpoint}`, params, options)
}

/**
 * Insert a single document into the collection
 *
 * @param {DbBase} db
 * @param {string} collectionName
 * @param {Object} document
 * @param {Object=} options
 * @returns {Promise<Object>}
 * @throws {DbError}
 */
async function insertOne(db, collectionName, document, options = {}) {
  return await postCollectionApi(db, collectionName, 'insertOne', { document: document }, options)
}

/**
 * Inserts multiple documents into the collection
 *
 * @param {DbBase} db
 * @param {string} collectionName
 * @param {Object[]} documents
 * @param {Object=} options
 * @returns {Promise<Object>}
 * @throws {DbError}
 */
async function insertMany(db, collectionName, documents, options = {}) {
  return await postCollectionApi(db, collectionName, 'insertMany', { documents: documents }, options)
}

/**
 * Retrieve the first document that matches the filter
 *
 * @param {DbBase} db
 * @param {string} collectionName
 * @param {Object} filter
 * @param {Object=} options
 * @returns {Promise<Object>}
 * @throws {DbError}
 */
async function findOne(db, collectionName, filter, options = {}) {
  return await postCollectionApi(db, collectionName, 'findOne', { filter: filter }, options)
}

/**
 * Update and return the first document that matches the filter
 *
 * @param {DbBase} db
 * @param {string} collectionName
 * @param {Object} filter
 * @param {Object} update
 * @param {Object=} options
 * @returns {Promise<Object>}
 * @throws {DbError}
 */
async function findOneAndUpdate(db, collectionName, filter, update, options = {}) {
  return await postCollectionApi(db, collectionName, 'findOneAndUpdate', { filter: filter, update: update }, options)
}

/**
 * Replace and return the first document that matches the filter
 *
 * @param {DbBase} db
 * @param {string} collectionName
 * @param {Object} filter
 * @param {Object} replacement
 * @param {Object=} options
 * @returns {Promise<Object>}
 * @throws {DbError}
 */
async function findOneAndReplace(db, collectionName, filter, replacement, options = {}) {
  return await postCollectionApi(
    db,
    collectionName,
    'findOneAndReplace',
    { filter: filter, replacement: replacement },
    options
  )
}

/**
 * Delete and return the first document that matches the filter
 *
 * @param {DbBase} db
 * @param {string} collectionName
 * @param {Object} filter
 * @param {Object=} options
 * @returns {Promise<Object>}
 * @throws {DbError}
 */
async function findOneAndDelete(db, collectionName, filter, options = {}) {
  return await postCollectionApi(db, collectionName, 'findOneAndDelete', { filter: filter }, options)
}

/**
 * Finds the first batch of documents that match the filter and return them as an array.
 * Does not allow retrieving more than one batch of results.
 *
 * @param {DbBase} db
 * @param {string} collectionName
 * @param {Object=} filter
 * @param {Object=} options
 * @returns {Object[]}
 * @throws {DbError}
 */
async function findArray(db, collectionName, filter, options = {}) {
  return await postCollectionApi(db, collectionName, 'findArray', { filter: filter }, options)
}

/**
 * Update the first document that matches the filter
 *
 * @param {DbBase} db
 * @param {string} collectionName
 * @param {Object} filter
 * @param {Object} update
 * @param {Object=} options
 * @returns {Promise<Object>}
 * @throws {DbError}
 */
async function updateOne(db, collectionName, filter, update, options = {}) {
  return await postCollectionApi(db, collectionName, 'updateOne', { filter: filter, update: update }, options)
}

/**
 * Updates all documents that match the filter
 *
 * @param {DbBase} db
 * @param {string} collectionName
 * @param {Object} filter
 * @param {Object} update
 * @param {Object=} options
 * @returns {Promise<Object>}
 * @throws {DbError}
 */
async function updateMany(db, collectionName, filter, update, options = {}) {
  return await postCollectionApi(db, collectionName, 'updateMany', { filter: filter, update: update }, options)
}

/**
 * Replace the first document that matches the filter
 *
 * @param {DbBase} db
 * @param {string} collectionName
 * @param {Object} filter
 * @param {Object} replacement
 * @param {Object=} options
 * @returns {Promise<Object>}
 * @throws {DbError}
 */
async function replaceOne(db, collectionName, filter, replacement, options = {}) {
  return await postCollectionApi(
    db,
    collectionName,
    'replaceOne',
    { filter: filter, replacement: replacement },
    options
  )
}

/**
 * Delete the first document that matches the filter
 *
 * @param {DbBase} db
 * @param {string} collectionName
 * @param {Object} filter
 * @param {Object=} options
 * @returns {Promise<Object>}
 * @throws {DbError}
 */
async function deleteOne(db, collectionName, filter, options = {}) {
  return await postCollectionApi(db, collectionName, 'deleteOne', { filter: filter }, options)
}

/**
 * Deletes all documents that match the filter
 *
 * @param {DbBase} db
 * @param {string} collectionName
 * @param {Object} filter
 * @param {Object=} options
 * @returns {Promise<Object>}
 * @throws {DbError}
 */
async function deleteMany(db, collectionName, filter, options = {}) {
  return await postCollectionApi(db, collectionName, 'deleteMany', { filter: filter }, options)
}

/**
 * Execute multiple insert/update/delete commands in one operation
 *
 * @param {DbBase} db
 * @param {string} collectionName
 * @param {Object[]} operations
 * @param {Object=} options
 * @returns {Promise<Object>}
 * @throws {DbError}
 */
async function bulkWrite(db, collectionName, operations, options = {}) {
  return await postCollectionApi(db, collectionName, 'bulkWrite', { operations: operations }, options)
}

/**
 * Find all documents that match the filter
 *
 * @param {DbBase} db
 * @param {string} collectionName
 * @param {Object=} filter
 * @param {Object=} options
 * @returns {FindCursor}
 * @throws {DbError}
 */
function find(db, collectionName, filter = {}, options = {}) {
  return new FindCursor(db, collectionName, filter, options)
}

/**
 * Executes an aggregation pipeline over the documents in a collection
 *
 * @param {DbBase} db
 * @param {string} collectionName
 * @param {Object[]=} pipeline
 * @param {Object=} options
 * @returns {AggregateCursor}
 * @throws {DbError}
 */
function aggregate(db, collectionName, pipeline = [], options = {}) {
  return new AggregateCursor(db, collectionName, pipeline, options)
}

/**
 * Get the list of indexes from the collection
 *
 * @param {DbBase} db
 * @param {string} collectionName
 * @returns {Promise<Object[]>}
 * @throws {DbError}
 */
async function getIndexes(db, collectionName) {
  return await postCollectionApi(db, collectionName, 'getIndexes')
}

/**
 * Create an index with the provided specification
 *
 * @param {DbBase} db
 * @param {string} collectionName
 * @param {Object} specification
 * @param {Object=} options
 * @returns {Promise<Object>}
 * @throws {DbError}
 */
async function createIndex(db, collectionName, specification, options = {}) {
  return await postCollectionApi(db, collectionName, 'createIndex', { specification: specification }, options)
}

/**
 * Drop the index with the provided name
 *
 * @param {DbBase} db
 * @param {string} collectionName
 * @param {string} index
 * @param {Object=} options
 * @returns {Promise<Object>}
 * @throws {DbError}
 */
async function dropIndex(db, collectionName, index, options = {}) {
  return await postCollectionApi(db, collectionName, 'dropIndex', { index: index }, options)
}

/**
 * Hide an index
 *
 * @param {DbBase} db
 * @param {string} collectionName
 * @param {string} index
 * @returns {Promise<Object>}
 * @throws {DbError}
 */
async function hideIndex(db, collectionName, index) {
  return await postCollectionApi(db, collectionName, 'hideIndex', { index: index })
}

/**
 * Unhide an index
 *
 * @param {DbBase} db
 * @param {string} collectionName
 * @param {string} index
 * @returns {Promise<Object>}
 * @throws {DbError}
 */
async function unhideIndex(db, collectionName, index) {
  return await postCollectionApi(db, collectionName, 'unhideIndex', { index: index })
}

/**
 * Find all distinct values for a field, optionally applying a filter
 *
 * @param {DbBase} db
 * @param {string} collectionName
 * @param {(Object|string)} field
 * @param {Object=} filter
 * @param {Object=} options
 * @returns {Promise<*[]>}
 * @throws {DbError}
 */
async function distinct(db, collectionName, field, filter = {}, options = {}) {
  return await postCollectionApi(db, collectionName, 'distinct', { field: field, filter: filter }, options)
}

/**
 * Count the number of documents in a collection, optionally applying a filter
 *
 * @param {DbBase} db
 * @param {string} collectionName
 * @param {Object=} filter
 * @param {Object=} options
 * @returns {Promise<number>}
 * @throws {DbError}
 */
async function countDocuments(db, collectionName, filter = {}, options = {}) {
  return await postCollectionApi(db, collectionName, 'countDocuments', { filter: filter }, options)
}

/**
 * Estimates the number of documents in a collection based on collection metadata
 *
 * @param {DbBase} db
 * @param {string} collectionName
 * @param {Object=} options
 * @returns {Promise<number>}
 * @throws {DbError}
 */
async function estimatedDocumentCount(db, collectionName, options = {}) {
  return await postCollectionApi(db, collectionName, 'estimatedDocumentCount', {}, options)
}

/**
 * Drop this collection from the database
 *
 * @param {DbBase} db
 * @param {string} collectionName
 * @param {Object=} options
 * @returns {Promise<void>}
 * @throws {DbError}
 */
async function drop(db, collectionName, options = {}) {
  await postCollectionApi(db, collectionName, 'drop', undefined, options)
}

/**
 * Rename this collection
 *
 * @param {DbBase} db
 * @param {string} collectionName
 * @param {string} newCollectionName
 * @param {Object=} options
 * @returns {Promise<void>}
 * @throws {DbError}
 */
async function renameCollection(db, collectionName, newCollectionName, options = {}) {
  await postCollectionApi(db, collectionName, 'renameCollection', { name: newCollectionName }, options)
}

/**
 * Validate the content of the collection
 *
 * @param {DbBase} db
 * @param {string} collectionName
 * @param {Object=} options
 * @returns {Promise<Object>}
 * @throws {DbError}
 */
async function validate(db, collectionName, options = {}) {
  return await postCollectionApi(db, collectionName, 'validate', undefined, options)
}

/**
 * Get collection statistics
 *
 * @param {DbBase} db
 * @param {string} collectionName
 * @param {Object=} options
 * @returns {Promise<Object>}
 * @throws {DbError}
 */
async function stats(db, collectionName, options = {}) {
  return await postCollectionApi(db, collectionName, 'stats', undefined, options)
}

module.exports = {
  insertOneApi: insertOne,
  insertManyApi: insertMany,
  findOneApi: findOne,
  findOneAndUpdateApi: findOneAndUpdate,
  findOneAndReplaceApi: findOneAndReplace,
  findOneAndDeleteApi: findOneAndDelete,
  findArrayApi: findArray,
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
  estimatedDocumentCountApi: estimatedDocumentCount,
  dropApi: drop,
  renameCollectionApi: renameCollection,
  validateApi: validate,
  statsApi: stats
}
