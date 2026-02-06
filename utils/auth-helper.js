/*
Copyright 2026 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

const { Ims, getToken, context} = require('@adobe/aio-lib-ims')
const { getCliEnv } = require('@adobe/aio-lib-env')
const logger = require('@adobe/aio-lib-core-logging')('@adobe/aio-lib-db:ims-auth', { provider: 'debug' })
const { CLI_CONTEXT_NAME } = require('../lib/constants')
const DbError = require('../lib/DbError')

/**
 * Retrieves an access token for authentication based on IMS context.
 * Context selection follows AIO CLI behavior:
 * If a current context is set, use it (non-cli context is preferred).
 * Otherwise default to `cli` and ensure it is set (CLI config lives in .aio/.env).
 * In runtime actions, the IMS context is stored in State instead of local files.
 * Token selection:
 * - If `useCachedToken` is true, read the cached token from the selected context.
 * - Otherwise, request a fresh token via IMS for the selected context.
 *
 * @async
 * @function getAccessToken
 * @param {object} [options]
 * @param {boolean} [options.useCachedToken=false] - Use cached token instead of requesting a new one, default: false
 * @returns {Promise<{accessToken: string}>} - returns accessToken
 * @throws {DbError} - throws if fails to retrieve an access token or context setup fails
 */
async function getAccessToken ({ useCachedToken = false } = {}) {
  const env = getCliEnv()
  logger.debug(`Retrieving IMS Token using env=${env}`)

  let contextName = CLI_CONTEXT_NAME
  try {
    const currentContext = await context.getCurrent()
    if (currentContext && currentContext !== CLI_CONTEXT_NAME) {
      contextName = currentContext
    } else {
      if (typeof context.setCli === 'function') {
        await context.setCli({ 'cli.bare-output': true }, false)
      } else if (typeof context.setCurrent === 'function') {
        await context.setCurrent(CLI_CONTEXT_NAME)
      }
    }
  } catch (err) {
    throw new DbError('Failed to retrieve IMS context', null, null, { cause: err })
  }

  let accessToken = null
  try {
    if (useCachedToken) {
      const { data } = await context.get(contextName)
      accessToken = data?.access_token?.token
    } else {
      accessToken = await getToken(contextName)
    }
  } catch (err) {
    throw new DbError(`Failed to retrieve access token from IMS context '${contextName}'`, null, null, { cause: err })
  }

  if (!accessToken) {
    throw new DbError(`Access token for IMS context '${contextName}' is not available`)
  }

  // Validate token
    try {
      const ims = new Ims(env)
      const imsValidation = await ims.validateToken(accessToken)
      if (!imsValidation.valid) {
        throw new DbError('Invalid IMS access token')
      }
    } catch (err) {
      throw new DbError('Failed to validate IMS access token', null, null, { cause: err })
    }

  return { accessToken }
}

module.exports = { getAccessToken }
