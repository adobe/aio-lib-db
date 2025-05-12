const logger = require('@adobe/aio-lib-core-logging')('@adobe/aio-lib-abdb', { provider: 'debug' })
const Abdb = require('./abdb')

/* *********************************** helpers & init() *********************************** */

function init(credentials = {}) {
  logger.info(`init with config: ${credentials}`)

  return Abdb.init(credentials)
}

module.exports = { init }
