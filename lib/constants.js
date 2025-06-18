require('dotenv/config')

// Set DB_SERVICE_URL='http://localhost:5000' in .env for local testing
const ENDPOINT_URL = process.env.DB_SERVICE_URL || 'https://core-commerce-saas-ab-dbproxy-service-deploy-ethos-d8c690.stage.cloud.adobe.io'

const RUNTIME_HEADER = 'x-runtime-namespace'
const REQUEST_ID_HEADER = 'x-request-id'

module.exports = {
  ENDPOINT_URL,
  RUNTIME_HEADER,
  REQUEST_ID_HEADER
}
