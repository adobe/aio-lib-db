const { ENDPOINT_URL } = require('../constants')

const DBSTATS_URL = `${ENDPOINT_URL}/v1/client/dbStats`
const CLOSE_URL = `${ENDPOINT_URL}/v1/client/close`

async function dbStats(tenantId, axiosClient) {
  try {
    const res = await axiosClient.get(
      DBSTATS_URL, {
      headers: {
        'x-abdb-tenant-id': tenantId
      }
    })
    if (!res.data.success) {
      throw new Error(`dbStats failed: ${res.data.message}`)
    }
    return res.data.data
  } catch (err) {
    throw err
  }
}

async function close(tenantId, axiosClient) {
  try {
    const res = await axiosClient.post(
      CLOSE_URL, {}, {
      headers: {
        'x-abdb-tenant-id': tenantId
      }
    })
    if (!res.data.success) {
      throw new Error(`close failed: ${res.data.message}`)
    }
    return res.data.data
  } catch (err) {
    throw err;
  }
}

module.exports = {
  dbStatsApi: dbStats,
  closeApi: close
}
