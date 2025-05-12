const { EJSON } = require('bson')
const { ENDPOINT_URL } = require('../constants')
const AbdbError = require('../abdbError')
const Cursor = require("../cursor")

/**
 * Hit the abdb proxy service API and return the result
 *
 * @param {string} tenantId
 * @param {AxiosStatic} axiosClient
 * @param {string} collectionName
 * @param {string} method
 * @param {Object} params
 * @param {Object} options
 * @returns {Promise<Object>}
 * @throws {AbdbError}
 */
async function apiMethod(tenantId, axiosClient, collectionName, method, params, options) {
  try {
    const res = await axiosClient.post(
      `${ENDPOINT_URL}/v1/collection/${collectionName}/${method}`,
      EJSON.stringify({
        ...params,
        options: options
      }, { relaxed: false }),
      {
        headers: {
          'x-abdb-tenant-id': tenantId
        }
      }
    )
    if (!res.data.success) {
      throw new AbdbError(`${method} failed: ${res.data.message}`)
    }
    return res.data.data
  }
  catch (err) {
    if (err.response?.data) {
      throw new AbdbError(`${method} failed: ${err.response.data.message}`, { cause: err })
    }
    throw err
  }
}

async function insertOne(tenantId, axiosClient, collectionName, document, options = {}) {
  return await apiMethod(tenantId, axiosClient, collectionName, 'insertOne', { document: document }, options)
}

/**
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
  return await apiMethod(tenantId, axiosClient, collectionName, 'insertMany', { documents: documents }, options)
}

async function findOne(tenantId, axiosClient, collectionName, query, options = {}) {
  return await apiMethod(tenantId, axiosClient, collectionName, 'findOne', { query: query }, options)
}

async function updateOne(tenantId, axiosClient, collectionName, filter, update, options = {}) {
  return await apiMethod(
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
  return await apiMethod(
    tenantId,
    axiosClient,
    collectionName,
    'updateMany',
    { filter: filter, update: update },
    options
  )
}

async function replaceOne(tenantId, axiosClient, collectionName, filter, replacement, options = {}) {
  return await apiMethod(
    tenantId,
    axiosClient,
    collectionName,
    'replaceOne',
    { filter: filter, replacement: replacement },
    options
  )
}

async function deleteOne(tenantId, axiosClient, collectionName, filter, options = {}) {
  return await apiMethod(tenantId, axiosClient, collectionName, 'deleteOne', { filter: filter }, options)
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
  return await apiMethod(tenantId, axiosClient, collectionName, 'deleteMany', { filter: filter }, options)
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
  return await apiMethod(tenantId, axiosClient, collectionName, 'bulkWrite', { operations: operations }, options)
}

async function find(tenantId, axiosClient, collectionName, filter, options = {}) {
  const data = await apiMethod(tenantId, axiosClient, collectionName, 'find', { filter: filter }, options)
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

async function aggregate(tenantId, axiosClient, collectionName, pipeline, options = {}) {
  const data = await apiMethod(tenantId, axiosClient, collectionName, 'aggregate', { pipeline: pipeline }, options)
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
