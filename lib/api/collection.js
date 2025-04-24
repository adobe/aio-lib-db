const { ENDPOINT_URL } = require('../constants')

function buildCollectionUrl(collectionName, method) {
  return `${ENDPOINT_URL}/v1/collection/${collectionName}/${method}`;
}

async function insertOne(tenantId, axiosClient, collectionName, document, options) {
  try {
    const res = await axiosClient.post(
      buildCollectionUrl(collectionName, 'insertOne'),
      {
        document: document,
        option: options
      },
      {
        headers: {
          'x-abdb-tenant-id': tenantId
        }
      })
    if (!res.data.success) {
      throw new Error(`status failed: ${res.data.message}`)
    }
    return res.data.data
  } catch (err) {
    throw err;
  }
}

module.exports = {
  insertOneApi: insertOne
}
