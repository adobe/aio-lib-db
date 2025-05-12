const { ENDPOINT_URL } = require('../constants')
const AbdbError = require('../abdbError')

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
      throw new AbdbError(`dbStats failed: ${res.data.message}`)
    }
    return res.data.data
  } catch (err) {
    if (err.response?.data) {
      throw new AbdbError(`findOne failed: ${err.response.data.message}`, { cause: err })
    }
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
      throw new AbdbError(`close failed: ${res.data.message}`)
    }
    return res.data.data
  } catch (err) {
    if (err.response?.data) {
      throw new AbdbError(`close failed: ${err.response.data.message}`, { cause: err })
    }
    throw err
  }
}

module.exports = {
  dbStatsApi: dbStats,
  closeApi: close
}
