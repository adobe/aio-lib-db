const { ENDPOINT_URL } = require('../constants');

const CONNECT_URL = `${ENDPOINT_URL}/v1/db/connect`;
const PROVISION_URL = `${ENDPOINT_URL}/v1/db/provision`;
const STATUS_URL = `${ENDPOINT_URL}/v1/db/status`;

async function dbConnect(tenantId, axiosClient) {
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
    return res.data.data
  } catch (err) {
    throw err;
  }
}

async function dbProvision(region, axiosClient) {
  try {
    const res = await axiosClient.post(
      PROVISION_URL, {
      "region": region
    })
    if (!res.data.success) {
      throw new Error(`provision failed: ${res.data.message}`)
    }
    return res.data.data
  } catch (err) {
    throw err;
  }
}

async function dbStatus(tenantId, axiosClient) {
  try {
    const res = await axiosClient.get(
      STATUS_URL, {
      headers: {
        'x-abdb-tenant-id': tenantId
      }
    })
    if (!res.data.success) {
      throw new Error(`status failed: ${res.data.message}`)
    }
    return res.data
  } catch (err) {
    throw err;
  }
}

module.exports = {
  dbConnect,
  dbProvision,
  dbStatus
}
