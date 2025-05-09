const { EJSON } = require('bson')
const { ENDPOINT_URL } = require('../constants')
const AbdbError = require('../abdbError')
const Cursor = require("../cursor")

function buildUrl(collectionName, method) {
  return `${ENDPOINT_URL}/v1/collection/${collectionName}/${method}`
}

function buildHeaders(tenantId) {
  return {
    headers: {
      'x-abdb-tenant-id': tenantId
    }
  }
}

async function insertOne(tenantId, axiosClient, collectionName, document, options = {}) {
  try {
    const res = await axiosClient.post(
      buildUrl(collectionName, 'insertOne'),
      EJSON.stringify({
        document: document,
        options: options
      }, { relaxed: false }),
      buildHeaders(tenantId)
    )
    if (!res.data.success) {
      throw new AbdbError(`insertOne failed: ${res.data.message}`)
    }
    return res.data.data
  }
  catch (err) {
    if (err.response?.data) {
      throw new AbdbError(`insertOne failed: ${err.response.data.message}`, { cause: err })
    }
    throw err
  }
}

async function findOne(tenantId, axiosClient, collectionName, query, options = {}) {
  try {
    const res = await axiosClient.post(
      buildUrl(collectionName, 'findOne'),
      EJSON.stringify({
        query: query,
        options: options
      }, { relaxed: false }),
      buildHeaders(tenantId)
    )
    if (!res.data.success) {
      throw new AbdbError(`findOne failed: ${res.data.message}`)
    }
    return res.data.data
  }
  catch (err) {
    if (err.response?.data) {
      throw new AbdbError(`findOne failed: ${err.response.data.message}`, { cause: err })
    }
    throw err
  }
}

async function updateOne(tenantId, axiosClient, collectionName, filter, update, options = {}) {
  try {
    const res = await axiosClient.post(
      buildUrl(collectionName, 'updateOne'),
      EJSON.stringify({
        filter: filter,
        update: update,
        options: options
      }, { relaxed: false }),
      buildHeaders(tenantId)
    )
    if (!res.data.success) {
      throw new Error(`updateOne failed: ${res.data.message}`)
    }
    return res.data.data
  }
  catch (err) {
    if (err.response?.data) {
      throw new AbdbError(`updateOne failed: ${err.response.data.message}`, { cause: err })
    }
    throw err
  }
}

async function replaceOne(tenantId, axiosClient, collectionName, filter, replacement, options = {}) {
  try {
    const res = await axiosClient.post(
      buildUrl(collectionName, 'replaceOne'),
      EJSON.stringify({
        filter: filter,
        replacement: replacement,
        options: options
      }, { relaxed: false }),
      buildHeaders(tenantId)
    )
    if (!res.data.success) {
      throw new AbdbError(`replaceOne failed: ${res.data.message}`)
    }
    return res.data.data
  }
  catch (err) {
    if (err.response?.data) {
      throw new AbdbError(`replaceOne failed: ${err.response.data.message}`, { cause: err })
    }
    throw err
  }
}

async function deleteOne(tenantId, axiosClient, collectionName, filter, options = {}) {
  try {
    const res = await axiosClient.post(
      buildUrl(collectionName, 'deleteOne'),
      EJSON.stringify({
        filter: filter,
        options: options
      }, { relaxed: false }),
      buildHeaders(tenantId)
    )
    if (!res.data.success) {
      throw new AbdbError(`deleteOne failed: ${res.data.message}`)
    }
    return res.data.data
  }
  catch (err) {
    if (err.response?.data) {
      throw new AbdbError(`deleteOne failed: ${err.response.data.message}`, { cause: err })
    }
    throw err
  }
}

async function find(tenantId, axiosClient, collectionName, filter, options = {}) {
  try {
    const res = await axiosClient.post(
      buildUrl(collectionName, 'find'),
      EJSON.stringify({
        filter: filter,
        options: options
      }, { relaxed: false }),
      buildHeaders(tenantId)
    )
    if (!res.data.success) {
      throw new AbdbError(`find failed: ${res.data.message}`)
    }

    const data = res.data.data
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
  catch (err) {
    if (err.response?.data) {
      throw new AbdbError(`find failed: ${err.response.data.message}`, { cause: err })
    }
    throw err
  }
}

async function aggregate(tenantId, axiosClient, collectionName, pipeline, options = {}) {
  try {
    const res = await axiosClient.post(
      buildUrl(collectionName, 'aggregate'),
      EJSON.stringify({
        pipeline: pipeline,
        options: options
      }, { relaxed: false }),
      buildHeaders(tenantId)
    )
    if (!res.data.success) {
      throw new AbdbError(`aggregate failed: ${res.data.message}`)
    }

    const data = res.data.data
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
  catch (err) {
    if (err.response?.data) {
      throw new AbdbError(`aggregate failed: ${err.response.data.message}`, { cause: err })
    }
    throw err
  }
}

module.exports = {
  insertOneApi: insertOne,
  findOneApi: findOne,
  updateOneApi: updateOne,
  replaceOneApi: replaceOne,
  deleteOneApi: deleteOne,
  findApi: find,
  aggregateApi: aggregate
}
