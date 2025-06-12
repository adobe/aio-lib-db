const logger = require('@adobe/aio-lib-core-logging')('@adobe/aio-lib-abdb', { provider: 'debug' })
const Abdb = require('./abdb')
require('dotenv/config')

/* *********************************** helpers & init() *********************************** */

async function init(runtimeNamespace = undefined, runtimeAuth = undefined) {
  const namespace = runtimeNamespace || process.env.AIO_runtime_namespace
  const auth = runtimeAuth || process.env.AIO_runtime_auth
  logger.info(`Initializing ABDB for namespace '${namespace}'`)

  return Abdb.init(namespace, auth)
}

module.exports = { init }
