const { ENDPOINT_URL } = require('../constants');
const AbdbError = require('../abdbError');

const CONNECT_URL = `${ENDPOINT_URL}/v1/db/connect`;
const PROVISION_URL = `${ENDPOINT_URL}/v1/db/provision`;
const STATUS_URL = `${ENDPOINT_URL}/v1/db/status`;

/**
 * Start an ABDB session
 *
 * @param {string} tenantId
 * @param {AxiosStatic} axiosClient
 * @returns {Promise<*>}
 * @throws {AbdbError}
 */
async function connect(tenantId, axiosClient) {
  try {
    const res = await axiosClient.post(
      CONNECT_URL, {}, {
      headers: {
        'x-abdb-tenant-id': tenantId
      }
    })
    if (!res.data.success) {
      throw new AbdbError(`connect failed: ${res.data.message}`)
    }
    return res.data.data
  } catch (err) {
    if (err.response?.data) {
      throw new AbdbError(`connect failed: ${err.response.data.message}`, { cause: err })
    }
    throw err
  }
}

/**
 * Provision a new tenant and return the id
 *
 * @param {string} region
 * @param {AxiosStatic} axiosClient
 * @returns {Promise<{"tenant_id": string}>}
 * @throws {AbdbError}
 */
async function provision(region, axiosClient) {
  try {
    const res = await axiosClient.post(
      PROVISION_URL, {
      "region": region
    })
    if (!res.data.success) {
      throw new AbdbError(`provision failed: ${res.data.message}`)
    }
    return res.data.data
  } catch (err) {
    if (err.response?.data) {
      throw new AbdbError(`provision failed: ${err.response.data.message}`, { cause: err })
    }
    throw err
  }
}

/**
 * Checks if a tenant has been provisioned
 *
 * @param {string} tenantId
 * @param {AxiosStatic} axiosClient
 * @returns {Promise<boolean>}
 * @throws {AbdbError}
 */
async function status(tenantId, axiosClient) {
  try {
    const res = await axiosClient.get(
      STATUS_URL, {
      headers: {
        'x-abdb-tenant-id': tenantId
      }
    })
    if (!res.data.success) {
      throw new AbdbError(`status failed: ${res.data.message}`)
    }
    return res.data.data
  } catch (err) {
    if (err.response?.data) {
      throw new AbdbError(`status failed: ${err.response.data.message}`, { cause: err })
    }
    throw err
  }
}

module.exports = {
  connectApi: connect,
  provisionApi: provision,
  statusApi: status
}
