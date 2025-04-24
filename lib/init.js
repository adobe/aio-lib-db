const logger = require('@adobe/aio-lib-core-logging')('@adobe/aio-lib-abdb', { provider: 'debug' })
const ABDB = require('./ABDB')

/* *********************************** helpers & init() *********************************** */

async function init(credentials = {}) {
  logger.info(`init with config: ${credentials}`)

  return ABDB.init(credentials)
}

module.exports = { init }
