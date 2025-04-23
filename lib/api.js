const { ENDPOINT_URL } = require('./constants')

const CONNECT_URL = `${ENDPOINT_URL}/v1/db/connect`
const DBSTATS_URL = `${ENDPOINT_URL}/v1/client/dbStats`
const CLOSE_CONNECTION_URL = `${ENDPOINT_URL}/v1/client/close`

async function connectToDb(tenantId, axiosClient) {
    try {
        const res = await axiosClient.post(
            CONNECT_URL, {}, {
            headers: {
                'x-abdb-tenant-id': tenantId
            }
        })
        if (!res.data.success) {
            throw new Error(`connect failed: ${res.data.message}`)
        }
        return await res.data.data
    } catch (err) {
        throw err
    }
}

async function getDbStats(tenantId, axiosClient) {
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
        return await res.data.data
    } catch (err) {
        throw err
    }
}

async function closeConnection(tenantId, axiosClient) {
    try {
        const res = await axiosClient.post(
            CLOSE_CONNECTION_URL, {}, {
            headers: {
                'x-abdb-tenant-id': tenantId
            }
        })
        if (!res.data.success) {
            throw new Error(`close failed: ${res.data.message}`)
        }
        return await res.data.data
    } catch (err) {
        throw err;
    }
}

module.exports = {
    connectToDb,
    getDbStats,
    closeConnection
}
