/*
Copyright 2025 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/
const DbBase = require('./DbBase')
require('dotenv/config')

/* *********************************** helpers & init() *********************************** */

/**
 * Initializes and returns the ADP Storage Database SDK.
 *
 * To use the SDK you must either provide your OpenWhisk credentials in `config.ow` or in the environment variables
 * `__OW_NAMESPACE`.
 *
 * @param {Object} config used to init the sdk
 * @param {('amer'|'apac'|'emea'|'aus')=} [config.region] optional region to use, default: `amer`
 * @param {Object=} [config.ow] Set those if you want to use ootb credentials to access the database service
 * @param {string=} [config.ow.namespace]
 * @param {string} config.token Ims acccess token required here to authenticate
 * @returns {Promise<DbBase>} A DbBase instance
 */
async function init (config) {
  const { namespace } = (config.ow ?? {})
  return DbBase.init({ namespace, region: config.region, token: config.token })
}

module.exports = { init }
