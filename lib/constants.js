const ENDPOINT_URL = 'https://core-commerce-saas-ab-dbproxy-service-deploy-ethos-d8c690.stage.cloud.adobe.io'
// const ENDPOINT_URL = 'http://localhost:5000' // local testing

const RUNTIME_HEADER = 'x-runtime-namespace'
const TENANT_HEADER = 'x-abdb-tenant-id'
const REQUEST_ID_HEADER = 'x-request-id'

module.exports = {
  ENDPOINT_URL,
  RUNTIME_HEADER,
  TENANT_HEADER,
  REQUEST_ID_HEADER
}
