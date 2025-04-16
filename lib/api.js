const { ENDPOINT_URL } = require('./constants')

const CONNECT_URL = `${ENDPOINT_URL}/v1/db/connect`
const DBSTATS_URL = `${ENDPOINT_URL}/v1/client/dbStats`
const DB_PROVISION_STATUS = `${ENDPOINT_URL}/v1/db/status`
const CLOSE_CONNECTION_URL = `${ENDPOINT_URL}/v1/client/close`

const { CookieJar } = require('node-fetch-cookies');
const fetch = require('node-fetch');

async function connectToDb(tenantId, jar) {
    try {

        const checkStatus = await jar.fetch(DB_PROVISION_STATUS, {
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

            return await res.json()
        }
        else {
            throw new Error(`Connect failed: tenantId ${tenantId} is not provisioned`)
        }
    } catch (err) {
        console.error('Error in creating connection:', err.message)
        throw err
    }
}

async function getDbStats(tenantId, jar) {
    try {
        const res = await jar.fetch(DBSTATS_URL, {
            method: 'GET',
            headers: {
                'x-abdb-tenant-id': tenantId
            }
        })

        if (!res.ok) {
            throw new Error(`DBStats failed: ${res.status} ${res.statusText}`)
        }

        return await res.json()
    } catch (err) {
        console.error('Error in fetching dbStats:', err.message)
        throw err
    }
}

async function closeConnection(tenantId, jar){
    try{
        const res = await jar.fetch(CLOSE_CONNECTION_URL, {
            method: 'POST',
            headers: {
                'x-abdb-tenant-id': tenantId
            }
        })

        if(!res.ok){
            throw new Error(`close connection failed: ${res.status} ${res.statusText}`)
        }

        return await res.json()
    }catch(err){
        console.error('Error in closing connection')

    }
}

module.exports = {
    connectToDb,
    getDbStats,
    closeConnection
}
