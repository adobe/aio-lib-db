const { ENDPOINT_URL } = require('./constants')

const CONNECT_URL = `${ENDPOINT_URL}/v1/db/connect`
const DBSTATS_URL = `${ENDPOINT_URL}/v1/client/dbStats`
const DB_PROVISION_STATUS = `${ENDPOINT_URL}/v1/db/status`
const CLOSE_CONNECTION_URL = `${ENDPOINT_URL}/v1/client/close`

async function connectToDb(tenantId) {
    try {

        const checkStatus = await fetch(DB_PROVISION_STATUS, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'x-abdb-tenant-id': tenantId
            }
        })

        if (!checkStatus.ok) {
            throw new Error(`Connect failed: ${res.status} ${res.statusText}`)
        }
        const checkProvisionStatus = await checkStatus.json();
        if (checkProvisionStatus.success) {
            const res = await fetch(CONNECT_URL, {
                method: 'POST',
                headers: {
                    'x-abdb-tenant-id': tenantId
                }
            })


            if (!res.ok) {
                throw new Error(`Connect failed: ${res.status} ${res.statusText}`)
            }

            const data = await res.json()
            return data
        }
        else {
            throw new Error(`Connect failed: tenantId ${tenantId} is not provisioned`)
        }
    } catch (err) {
        console.error('Error in creating connection:', err.message)
        throw err
    }
}

async function getDbStats(tenantId) {
    try {
        const res = await fetch(DBSTATS_URL, {
            method: 'GET',
            headers: {
                'x-abdb-tenant-id': tenantId
            }
        })

        if (!res.ok) {
            throw new Error(`DBStats failed: ${res.status} ${res.statusText}`)
        }

        const data = await res.json()
        return data
    } catch (err) {
        console.error('Error in fetching dbStats:', err.message)
        throw err
    }
}

async function closeConnection(tenantId){
    try{
        const res = await fetch(CLOSE_CONNECTION_URL, {
            method: 'POST',
            headers: {
                'x-abdb-tenant-id': tenantId
            }
        })

        if(!res.ok){
            throw new Error(`close connection failed: ${res.status} ${res.statusText}`)
        }

        const data = await res.json()
        return data
    }catch(err){
        console.error('Error in closing connection')

    }
}

module.exports = {
    connectToDb,
    getDbStats,
    closeConnection
}
