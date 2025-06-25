require('dotenv/config')

// Set ABDB_SERVICE_URL='http://localhost:5000' in .env for local testing
const ENDPOINT_URL = process.env.ABDB_SERVICE_URL || 'https://core-commerce-saas-ab-dbproxy-service-deploy-ethos-d8c690.stage.cloud.adobe.io'

const RUNTIME_HEADER = 'x-runtime-namespace'
const REQUEST_ID_HEADER = 'x-request-id'

const CURSOR_INIT_ERR_MESSAGE = 'Cursor has already been initialized, cannot modify request.'

module.exports = {
  ENDPOINT_URL,
  RUNTIME_HEADER,
  REQUEST_ID_HEADER,
  CURSOR_INIT_ERR_MESSAGE
}
