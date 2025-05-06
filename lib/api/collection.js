const { EJSON } = require('bson')
const { ENDPOINT_URL } = require('../constants')
const AbdbError = require('../abdbError')

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
      throw new AbdbError(`insertOne failed: ${res.data.message}`)
    }
    return EJSON.parse(EJSON.stringify(res.data.data))
  } catch (err) {
    if (err.response?.data) {
      throw new AbdbError(`insertOne failed: ${err.response.data.message}`, { cause: err })
    }
    throw err
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
      throw new AbdbError(`findOne failed: ${res.data.message}`)
    }
    return EJSON.parse(EJSON.stringify(res.data.data))
  } catch (err) {
    if (err.response?.data) {
      throw new AbdbError(`findOne failed: ${err.response.data.message}`, { cause: err })
    }
    throw err
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
    if (err.response?.data) {
      throw new AbdbError(`updateOne failed: ${err.response.data.message}`, { cause: err })
    }
    throw err
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
      throw new AbdbError(`replaceOne failed: ${res.data.message}`)
    }
    return EJSON.parse(EJSON.stringify(res.data.data))
  } catch (err) {
    if (err.response?.data) {
      throw new AbdbError(`replaceOne failed: ${err.response.data.message}`, { cause: err })
    }
    throw err
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
      throw new AbdbError(`deleteOne failed: ${res.data.message}`)
    }
    return EJSON.parse(EJSON.stringify(res.data.data))
  } catch (err) {
    if (err.response?.data) {
      throw new AbdbError(`deleteOne failed: ${err.response.data.message}`, { cause: err })
    }
    throw err
  }
}

module.exports = {
  insertOneApi: insertOne,
  findOneApi: findOne,
  updateOneApi: updateOne,
  replaceOneApi: replaceOne,
  deleteOneApi: deleteOne
}
