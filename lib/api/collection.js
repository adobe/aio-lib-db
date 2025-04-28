const { EJSON } = require('bson')
const { ENDPOINT_URL } = require('../constants')

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

async function insertOne(tenantId, axiosClient, collectionName, document, options) {
  try {
    const res = await axiosClient.post(
      buildUrl(collectionName, 'insertOne'),
      EJSON.stringify({
        document: document,
        options: options
      }),
      buildHeaders(tenantId)
    )
    if (!res.data.success) {
      throw new Error(`insertOne failed: ${res.data.message}`)
    }
    return EJSON.parse(EJSON.stringify(res.data.data))
  } catch (err) {
    throw err;
  }
}

async function findOne(tenantId, axiosClient, collectionName, query, options) {
  try {
    const res = await axiosClient.post(
      buildUrl(collectionName, 'findOne'),
      EJSON.stringify({
        query: query,
        options: options
      }),
      buildHeaders(tenantId)
    )
    if (!res.data.success) {
      throw new Error(`findOne failed: ${res.data.message}`)
    }
    return EJSON.parse(EJSON.stringify(res.data.data))
  } catch (err) {
    throw err;
  }
}

async function updateOne(tenantId, axiosClient, collectionName, filter, update, options) {
  try {
    const res = await axiosClient.post(
      buildUrl(collectionName, 'updateOne'),
      EJSON.stringify({
        filter: filter,
        update: update,
        options: options
      }),
      buildHeaders(tenantId)
    )
    if (!res.data.success) {
      throw new Error(`updateOne failed: ${res.data.message}`)
    }
    return EJSON.parse(EJSON.stringify(res.data.data))
  } catch (err) {
    throw err;
  }
}

async function replaceOne(tenantId, axiosClient, collectionName, filter, replacement, options) {
  try {
    const res = await axiosClient.post(
      buildUrl(collectionName, 'replaceOne'),
      EJSON.stringify({
        filter: filter,
        replacement: replacement,
        options: options
      }),
      buildHeaders(tenantId)
    )
    if (!res.data.success) {
      throw new Error(`replaceOne failed: ${res.data.message}`)
    }
    return EJSON.parse(EJSON.stringify(res.data.data))
  } catch (err) {
    throw err;
  }
}

async function deleteOne(tenantId, axiosClient, collectionName, filter, options) {
  try {
    const res = await axiosClient.post(
      buildUrl(collectionName, 'deleteOne'),
      EJSON.stringify({
        filter: filter,
        options: options
      }),
      buildHeaders(tenantId)
    )
    if (!res.data.success) {
      throw new Error(`deleteOne failed: ${res.data.message}`)
    }
    return EJSON.parse(EJSON.stringify(res.data.data))
  } catch (err) {
    throw err;
  }
}

module.exports = {
  insertOneApi: insertOne,
  findOneApi: findOne,
  updateOneApi: updateOne,
  replaceOneApi: replaceOne,
  deleteOneApi: deleteOne
}
