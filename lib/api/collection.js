const Cursor = require("../cursor")
const { apiPost } = require("../../utils/apiRequest")

/**
 * Make a post request to the abdb proxy service collection API and return the result
 *
 * @param {string} tenantId
 * @param {AxiosStatic} axiosClient
 * @param {string} collectionName
 * @param {string} endpoint
 * @param {Object} params
 * @param {Object} options
 * @returns {Promise<Object>}
 * @throws {AbdbError}
 */
async function postCollectionApi(tenantId, axiosClient, collectionName, endpoint, params = {}, options = {}) {
  return await apiPost(axiosClient, `collection/${collectionName}/${endpoint}`, tenantId, params, options)
}

/**
 * Insert a single document into the collection
 *
 * @param {string} tenantId
 * @param {AxiosStatic} axiosClient
 * @param {string} collectionName
 * @param {Object} document
 * @param {Object=} options
 * @returns {Promise<Object>}
 * @throws {AbdbError}
 */
async function insertOne(tenantId, axiosClient, collectionName, document, options = {}) {
  return await postCollectionApi(tenantId, axiosClient, collectionName, 'insertOne', { document: document }, options)
}

/*
 * Inserts multiple documents into the collection
 *
 * @param {string} tenantId
 * @param {AxiosStatic} axiosClient
 * @param {string} collectionName
 * @param {Object[]} documents
 * @param {Object=} options
 * @returns {Promise<Object>}
 * @throws {AbdbError}
 */
async function insertMany(tenantId, axiosClient, collectionName, documents, options = {}) {
  return await postCollectionApi(tenantId, axiosClient, collectionName, 'insertMany', { documents: documents }, options)
}

/**
 * Retrieve the first document that matches the query
 *
 * @param {string} tenantId
 * @param {AxiosStatic} axiosClient
 * @param {string} collectionName
 * @param {Object} query
 * @param {Object=} options
 * @returns {Promise<Object>}
 * @throws {AbdbError}
 */
async function findOne(tenantId, axiosClient, collectionName, query, options = {}) {
  return await postCollectionApi(tenantId, axiosClient, collectionName, 'findOne', { query: query }, options)
}

/**
 * Update the first document that matches the filter
 *
 * @param {string} tenantId
 * @param {AxiosStatic} axiosClient
 * @param {string} collectionName
 * @param {Object} filter
 * @param {Object} update
 * @param {Object=} options
 * @returns {Promise<Object>}
 * @throws {AbdbError}
 */
async function updateOne(tenantId, axiosClient, collectionName, filter, update, options = {}) {
  return await postCollectionApi(
    tenantId,
    axiosClient,
    collectionName,
    'updateOne',
    { filter: filter, update: update },
    options
  )
}

/**
 * Updates all documents that match the filter
 *
 * @param {string} tenantId
 * @param {AxiosStatic} axiosClient
 * @param {string} collectionName
 * @param {Object} filter
 * @param {Object} update
 * @param {Object=} options
 * @returns {Promise<Object>}
 * @throws {AbdbError}
 */
async function updateMany(tenantId, axiosClient, collectionName, filter, update, options = {}) {
  return await postCollectionApi(
    tenantId,
    axiosClient,
    collectionName,
    'updateMany',
    { filter: filter, update: update },
    options
  )
}

/**
 * Replace the first document that matches the filter
 *
 * @param {string} tenantId
 * @param {AxiosStatic} axiosClient
 * @param {string} collectionName
 * @param {Object} filter
 * @param {Object} replacement
 * @param {Object=} options
 * @returns {Promise<Object>}
 * @throws {AbdbError}
 */
async function replaceOne(tenantId, axiosClient, collectionName, filter, replacement, options = {}) {
  return await postCollectionApi(
    tenantId,
    axiosClient,
    collectionName,
    'replaceOne',
    { filter: filter, replacement: replacement },
    options
  )
}

/**
 * Delete the first document that matches the filter
 *
 * @param {string} tenantId
 * @param {AxiosStatic} axiosClient
 * @param {string} collectionName
 * @param {Object} filter
 * @param {Object=} options
 * @returns {Promise<Object>}
 * @throws {AbdbError}
 */
async function deleteOne(tenantId, axiosClient, collectionName, filter, options = {}) {
  return await postCollectionApi(tenantId, axiosClient, collectionName, 'deleteOne', { filter: filter }, options)
}

/**
 * Deletes all documents that match the filter
 *
 * @param {string} tenantId
 * @param {AxiosStatic} axiosClient
 * @param {string} collectionName
 * @param {Object} filter
 * @param {Object=} options
 * @returns {Promise<Object>}
 * @throws {AbdbError}
 */
async function deleteMany(tenantId, axiosClient, collectionName, filter, options = {}) {
  return await postCollectionApi(tenantId, axiosClient, collectionName, 'deleteMany', { filter: filter }, options)
}

/**
 * Execute multiple insert/update/delete commands in one operation
 *
 * @param {string} tenantId
 * @param {AxiosStatic} axiosClient
 * @param {string} collectionName
 * @param {Object[]} operations
 * @param {Object=} options
 * @returns {Promise<Object>}
 * @throws {AbdbError}
 */
async function bulkWrite(tenantId, axiosClient, collectionName, operations, options = {}) {
  return await postCollectionApi(
    tenantId,
    axiosClient,
    collectionName,
    'bulkWrite',
    { operations: operations },
    options
  )
}

/**
 * Find all documents that match the filter
 *
 * @param {string} tenantId
 * @param {AxiosStatic} axiosClient
 * @param {string} collectionName
 * @param {Object} filter
 * @param {Object=} options
 * @returns {Promise<Object>}
 * @throws {AbdbError}
 */
async function find(tenantId, axiosClient, collectionName, filter, options = {}) {
  const data = await postCollectionApi(tenantId, axiosClient, collectionName, 'find', { filter: filter }, options)
  return new Cursor(
    axiosClient,
    { type: 'FIND', filter: filter },
    tenantId,
    collectionName,
    data.cursor.id,
    data.cursor['firstBatch'],
    options
  )
}

/**
 * Executes an aggregation pipeline over the documents in a collection
 *
 * @param {string} tenantId
 * @param {AxiosStatic} axiosClient
 * @param {string} collectionName
 * @param {Object[]} pipeline
 * @param {Object=} options
 * @returns {Promise<Cursor>}
 * @throws {AbdbError}
 */
async function aggregate(tenantId, axiosClient, collectionName, pipeline, options = {}) {
  const data = await postCollectionApi(
    tenantId,
    axiosClient,
    collectionName,
    'aggregate',
    { pipeline: pipeline },
    options
  )
  return new Cursor(
    axiosClient,
    { type: 'AGGREGATE', pipeline: pipeline },
    tenantId,
    collectionName,
    data.cursor.id,
    data.cursor['firstBatch'],
    options
  )
}

module.exports = {
  insertOneApi: insertOne,
  insertManyApi: insertMany,
  findOneApi: findOne,
  updateOneApi: updateOne,
  updateManyApi: updateMany,
  replaceOneApi: replaceOne,
  deleteOneApi: deleteOne,
  deleteManyApi: deleteMany,
  bulkWriteApi: bulkWrite,
  findApi: find,
  aggregateApi: aggregate
}
