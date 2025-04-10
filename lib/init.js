

const logger = require('@adobe/aio-lib-core-logging')('@adobe/aio-lib-abdb', { provider: 'debug' })
const AdobeDocDB = require('./AdobeDocDB')

/* *********************************** helpers & init() *********************************** */

async function init (credentials = {}) {
  logger.info(`init with config: ${credentials}`)

  return AdobeDocDB.init({credentials})
}

module.exports = { init }