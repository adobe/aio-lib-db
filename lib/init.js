const logger = require('@adobe/aio-lib-core-logging')('@adobe/aio-lib-db', { provider: 'debug' })
const Db = require('./Db')
require('dotenv/config')

/* *********************************** helpers & init() *********************************** */

async function init(runtimeNamespace = undefined, runtimeAuth = undefined) {
  const namespace = runtimeNamespace || process.env.AIO_runtime_namespace
  const auth = runtimeAuth || process.env.AIO_runtime_auth
  logger.info(`Initializing DB for namespace '${namespace}'`)

  return Db.init(namespace, auth)
}

module.exports = { init }
