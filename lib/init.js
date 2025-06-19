const DbBase = require('./DbBase')
require('dotenv/config')

/* *********************************** helpers & init() *********************************** */

async function init(runtimeNamespace = undefined, runtimeAuth = undefined) {
  return DbBase.init(runtimeNamespace || process.env.AIO_runtime_namespace, runtimeAuth || process.env.AIO_runtime_auth)
}

module.exports = { init }
