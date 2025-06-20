const DbBase = require('./DbBase')
require('dotenv/config')

/* *********************************** helpers & init() *********************************** */

async function init(runtimeNamespace = process.env.AIO_runtime_namespace, runtimeAuth = process.env.AIO_runtime_auth) {
  return DbBase.init(runtimeNamespace, runtimeAuth)
}

module.exports = { init }
