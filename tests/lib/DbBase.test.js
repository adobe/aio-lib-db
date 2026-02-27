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
const { getDb, TEST_NAMESPACE, TEST_ACCESS_TOKEN } = require("../testingUtils")
const DbBase = require("../../lib/DbBase")
const {
  PROD_ENV, STAGE_ENV, ALLOWED_REGIONS, PROD_ENDPOINT_EXTERNAL, STAGE_ENDPOINT, PROD_ENDPOINT_RUNTIME
} = require("../../lib/constants")
const { apiGet, apiPost } = require("../../utils/apiRequest")
const { getCliEnv } = require('@adobe/aio-lib-env')
const { getRegionFromAppConfig, writeRegionToAppConfig } = require("../../utils/manifestUtils")

jest.mock("../../utils/manifestUtils")

describe('DbBase tests', () => {
  let db
  let nonSessClient

  beforeEach(async () => {
    db = getDb()
    nonSessClient = db.axiosClient
    getRegionFromAppConfig.mockReturnValue(null) // Default: no region in manifest
    writeRegionToAppConfig.mockReturnValue(true) // Default: successful write
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  test('provisionRequest succeeds even when no app.config.yaml found', async () => {
    writeRegionToAppConfig.mockReturnValue(false) // No file found
    await db.provisionRequest()
    expect(nonSessClient).toHaveCalledServicePost('v1/db/provision/request')
  })

  test('provisionRequest succeeds even on manifest write error', async () => {
    writeRegionToAppConfig.mockImplementation(() => {
      throw new Error('Permission denied')
    })
    await db.provisionRequest()
    expect(nonSessClient).toHaveCalledServicePost('v1/db/provision/request')
  })

  test('provisionRequest updates manifest with region after successful provision', async () => {
    await db.provisionRequest()
    expect(nonSessClient).toHaveCalledServicePost('v1/db/provision/request')
    expect(writeRegionToAppConfig).toHaveBeenCalledWith(process.cwd(), db.region)
  })

  test('provisionStatus calls the appropriate endpoint', async () => {
    await db.provisionStatus()
    expect(nonSessClient).toHaveCalledServicePost('v1/db/provision/status', {})
    expect(await nonSessClient.getSessionCookies()).toEqual([])
  })

  test('deleteDatabase calls the appropriate endpoint', async () => {
    await db.deleteDatabase()
    expect(nonSessClient).toHaveCalledServicePost('v1/db/delete')
    expect(await nonSessClient.getSessionCookies()).toEqual([])
  })

  test('ping calls the appropriate endpoint', async () => {
    await db.ping()
    expect(nonSessClient).toHaveCalledServiceGet('v1/db/ping')
    expect(await nonSessClient.getSessionCookies()).toEqual([])
  })

  test.each([
    { env: 'default', url: 'https://db.<region>.adobe.test', regions: ALLOWED_REGIONS[PROD_ENV] }, // default to prod
    { env: PROD_ENV, url: 'https://db.<region>.adobe.test', regions: ALLOWED_REGIONS[PROD_ENV] },
    { env: STAGE_ENV, url: 'https://db-stg.<region>.adobe.test', regions: ALLOWED_REGIONS[STAGE_ENV] }
  ])('serviceUrl for $env environment is set based on region', async ({ env, url, regions }) => {
    if (env === 'default') {
      delete process.env.AIO_DB_ENVIRONMENT
    }
    else {
      process.env.AIO_DB_ENVIRONMENT = env
    }

    for (const region of regions) {
      const expectedUrl = url.replaceAll(/<region>/gi, region)
      const dbInstance = await DbBase.init({ region: region, namespace: TEST_NAMESPACE, token: TEST_ACCESS_TOKEN })
      const axiosClient = dbInstance.axiosClient
      expect(dbInstance.serviceUrl).toBe(expectedUrl)
      await apiGet(dbInstance, axiosClient, 'db/ping')
      expect(axiosClient).toHaveCalledServiceGet(`${expectedUrl}/v1/db/ping`)
      await apiPost(dbInstance, axiosClient, 'db/provision/status')
      expect(axiosClient).toHaveCalledServicePost(`${expectedUrl}/v1/db/provision/status`)
    }

    // Test default region
    const defaultRegion = regions.at(0)
    const expectedUrl = url.replaceAll(/<region>/gi, defaultRegion)
    const defaultDb = await DbBase.init({ namespace: TEST_NAMESPACE, token: TEST_ACCESS_TOKEN })
    const axiosClient = defaultDb.axiosClient
    expect(defaultDb.serviceUrl).toBe(expectedUrl)
    await apiGet(defaultDb, axiosClient, 'db/ping')
    expect(axiosClient).toHaveCalledServiceGet(`${expectedUrl}/v1/db/ping`)
    await apiPost(defaultDb, axiosClient, 'db/provision/status')
    expect(axiosClient).toHaveCalledServicePost(`${expectedUrl}/v1/db/provision/status`)
  })

  test('serviceUrl can be overridden with AIO_DB_ENDPOINT environment variable', async () => {
    const customEndpoint = 'https://custom-db.adobe.test'
    const expectedPing = `${customEndpoint}/v1/db/ping`
    const expectedStatus = `${customEndpoint}/v1/db/provision/status`
    process.env.AIO_DB_ENDPOINT = customEndpoint

    // Test that override applies regardless of the execution context
    // Default (External)
    const dbCustomExternal = await DbBase.init({ namespace: TEST_NAMESPACE, token: TEST_ACCESS_TOKEN })
    const externalAxios = dbCustomExternal.axiosClient
    expect(dbCustomExternal.serviceUrl).toBe(customEndpoint)
    await apiGet(dbCustomExternal, externalAxios, 'db/ping')
    expect(externalAxios).toHaveCalledServiceGet(expectedPing)
    await apiPost(dbCustomExternal, externalAxios, 'db/provision/status')
    expect(externalAxios).toHaveCalledServicePost(expectedStatus)

    // Runtime
    process.env.__OW_ACTIVATION_ID = 'some-activation-id'
    const dbCustomRuntime = await DbBase.init({ namespace: TEST_NAMESPACE, token: TEST_ACCESS_TOKEN })
    const runtimeAxios = dbCustomRuntime.axiosClient
    expect(dbCustomRuntime.serviceUrl).toBe(customEndpoint)
    await apiGet(dbCustomRuntime, runtimeAxios, 'db/ping')
    expect(runtimeAxios).toHaveCalledServiceGet(expectedPing)
    await apiPost(dbCustomRuntime, runtimeAxios, 'db/provision/status')
    expect(runtimeAxios).toHaveCalledServicePost(expectedStatus)
  })

  test.each([
    { env: 'default', allowed: ALLOWED_REGIONS[PROD_ENV], otherEnvRegions: ALLOWED_REGIONS[STAGE_ENV] }, // default prod
    { env: PROD_ENV, allowed: ALLOWED_REGIONS[PROD_ENV], otherEnvRegions: ALLOWED_REGIONS[STAGE_ENV] },
    { env: STAGE_ENV, allowed: ALLOWED_REGIONS[STAGE_ENV], otherEnvRegions: ALLOWED_REGIONS[PROD_ENV] }
  ])('throws error only for unsupported regions in $env environment', async ({ env, allowed, otherEnvRegions }) => {
    if (env === 'default') {
      delete process.env.AIO_DB_ENVIRONMENT
    }
    else {
      process.env.AIO_DB_ENVIRONMENT = env
    }
    const unsupported = [
      `unsupported-${env}-region`,
      ...otherEnvRegions.filter(r => !allowed.includes(r))
    ]

    for (const r of allowed) {
      await expect(DbBase.init({ region: r, namespace: TEST_NAMESPACE, token: TEST_ACCESS_TOKEN })).resolves
    }
    for (const r of unsupported) {
      await expect(
        DbBase.init({ region: r, namespace: TEST_NAMESPACE, token: TEST_ACCESS_TOKEN })
      ).rejects.toThrow(`Invalid region '${r}'`)
    }
  })

  test('serviceUrl prefers AIO_DB_ENVIRONMENT over getCliEnv()', async () => {
    const region = 'amer'
    const prodUrl = PROD_ENDPOINT_EXTERNAL.replaceAll(/<region>/gi, region)
    const stageUrl = STAGE_ENDPOINT.replaceAll(/<region>/gi, region)

    // Set AIO_DB_ENVIRONMENT to prod and getCliEnv() to stage, expect prod
    process.env.AIO_DB_ENVIRONMENT = PROD_ENV
    getCliEnv.mockReturnValue(STAGE_ENV)
    let dbInstance = await DbBase.init({ namespace: TEST_NAMESPACE, token: TEST_ACCESS_TOKEN, region })
    expect(dbInstance.serviceUrl).toBe(prodUrl)

    // Set AIO_DB_ENVIRONMENT to stage and getCliEnv() to prod, expect stage
    process.env.AIO_DB_ENVIRONMENT = STAGE_ENV
    getCliEnv.mockReturnValue(PROD_ENV)
    dbInstance = await DbBase.init({ namespace: TEST_NAMESPACE, token: TEST_ACCESS_TOKEN, region })
    expect(dbInstance.serviceUrl).toBe(stageUrl)

    // Remove AIO_DB_ENVIRONMENT, expect getCliEnv() to take precedence
    delete process.env.AIO_DB_ENVIRONMENT
    getCliEnv.mockReturnValue(PROD_ENV)
    dbInstance = await DbBase.init({ namespace: TEST_NAMESPACE, token: TEST_ACCESS_TOKEN, region })
    expect(dbInstance.serviceUrl).toBe(prodUrl)

    getCliEnv.mockReturnValue(STAGE_ENV)
    dbInstance = await DbBase.init({ namespace: TEST_NAMESPACE, token: TEST_ACCESS_TOKEN, region })
    expect(dbInstance.serviceUrl).toBe(stageUrl)
  })

  test('uses correct endpoints based on execution context', async () => {
    const region = 'amer'
    const stageUrl = STAGE_ENDPOINT.replaceAll(/<region>/gi, region)
    const runtimeProdUrl = PROD_ENDPOINT_RUNTIME.replaceAll(/<region>/gi, region)
    const externalProdUrl = PROD_ENDPOINT_EXTERNAL.replaceAll(/<region>/gi, region)

    // Test with __OW_ACTIVATION_ID set (runtime context)
    process.env.__OW_ACTIVATION_ID = 'some-activation-id'
    // Simulate normal runtime (not "aio app dev")
    delete process.env.AIO_DEV

    process.env.AIO_DB_ENVIRONMENT = STAGE_ENV
    const runtimeStageDb = await DbBase.init({ namespace: TEST_NAMESPACE, token: TEST_ACCESS_TOKEN, region })
    expect(runtimeStageDb.serviceUrl).toBe(stageUrl)

    process.env.AIO_DB_ENVIRONMENT = PROD_ENV
    const runtimeProdDb = await DbBase.init({ namespace: TEST_NAMESPACE, token: TEST_ACCESS_TOKEN, region })
    expect(runtimeProdDb.serviceUrl).toBe(runtimeProdUrl)

    delete process.env.AIO_DB_ENVIRONMENT
    const runtimeDefaultDb = await DbBase.init({ namespace: TEST_NAMESPACE, token: TEST_ACCESS_TOKEN, region })
    expect(runtimeDefaultDb.serviceUrl).toBe(runtimeProdUrl)

    // Simulate "aio app dev" by setting AIO_DEV
    process.env.AIO_DEV = 'true'

    process.env.AIO_DB_ENVIRONMENT = STAGE_ENV
    const runtimeStageDevDb = await DbBase.init({ namespace: TEST_NAMESPACE, token: TEST_ACCESS_TOKEN, region })
    expect(runtimeStageDevDb.serviceUrl).toBe(stageUrl)

    process.env.AIO_DB_ENVIRONMENT = PROD_ENV
    const runtimeProdDevDb = await DbBase.init({ namespace: TEST_NAMESPACE, token: TEST_ACCESS_TOKEN, region })
    expect(runtimeProdDevDb.serviceUrl).toBe(externalProdUrl)

    delete process.env.AIO_DB_ENVIRONMENT
    const runtimeDefaultDevDb = await DbBase.init({ namespace: TEST_NAMESPACE, token: TEST_ACCESS_TOKEN, region })
    expect(runtimeDefaultDevDb.serviceUrl).toBe(externalProdUrl)

    // Test without __OW_ACTIVATION_ID (non-runtime context)
    delete process.env.__OW_ACTIVATION_ID
    delete process.env.AIO_DEV

    process.env.AIO_DB_ENVIRONMENT = STAGE_ENV
    // Stage endpoint is the same for both contexts
    const externalStageDb = await DbBase.init({ namespace: TEST_NAMESPACE, token: TEST_ACCESS_TOKEN, region })
    expect(externalStageDb.serviceUrl).toBe(stageUrl)

    process.env.AIO_DB_ENVIRONMENT = PROD_ENV
    const externalProdDb = await DbBase.init({ namespace: TEST_NAMESPACE, token: TEST_ACCESS_TOKEN, region })
    expect(externalProdDb.serviceUrl).toBe(externalProdUrl)

    delete process.env.AIO_DB_ENVIRONMENT
    const externalDefaultDb = await DbBase.init({ namespace: TEST_NAMESPACE, token: TEST_ACCESS_TOKEN, region })
    expect(externalDefaultDb.serviceUrl).toBe(externalProdUrl)

    // Make sure external behavior doesn't change if AIO_DEV is set
    process.env.AIO_DEV = 'true'

    process.env.AIO_DB_ENVIRONMENT = STAGE_ENV
    const externalStageDevDb = await DbBase.init({ namespace: TEST_NAMESPACE, token: TEST_ACCESS_TOKEN, region })
    expect(externalStageDevDb.serviceUrl).toBe(stageUrl)

    process.env.AIO_DB_ENVIRONMENT = PROD_ENV
    const externalProdDevDb = await DbBase.init({ namespace: TEST_NAMESPACE, token: TEST_ACCESS_TOKEN, region })
    expect(externalProdDevDb.serviceUrl).toBe(externalProdUrl)

    delete process.env.AIO_DB_ENVIRONMENT
    const externalDefaultDevDb = await DbBase.init({ namespace: TEST_NAMESPACE, token: TEST_ACCESS_TOKEN, region })
    expect(externalDefaultDevDb.serviceUrl).toBe(externalProdUrl)
  })

  test('db should be initialized in region from manifest when available', async () => {
    getRegionFromAppConfig.mockReturnValue('emea')

    const db = await DbBase.init({ namespace: TEST_NAMESPACE, token: TEST_ACCESS_TOKEN })

    expect(db.region).toBe('emea')
    expect(getRegionFromAppConfig).toHaveBeenCalledWith(process.cwd())
  })

  test('db initialization should fall back to config.region when manifest is not available', async () => {
    getRegionFromAppConfig.mockReturnValue(null)

    const db = await DbBase.init({ namespace: TEST_NAMESPACE, token: TEST_ACCESS_TOKEN, region: 'apac' })

    expect(db.region).toBe('apac')
  })

  test('db initialization should throw error when manifest parsing fails', async () => {
    getRegionFromAppConfig.mockImplementation(() => {
      throw new Error('YAML parsing error')
    })

    await expect(DbBase.init({ namespace: TEST_NAMESPACE, token: TEST_ACCESS_TOKEN, region: 'amer' }))
      .rejects.toThrow('Error reading region from app config: YAML parsing error')
  })

  test('db initialization should use default region when no manifest or config region available', async () => {
    getRegionFromAppConfig.mockReturnValue(null)

    const db = await DbBase.init({ namespace: TEST_NAMESPACE, token: TEST_ACCESS_TOKEN })

    expect(db.region).toBe(ALLOWED_REGIONS[getCliEnv()].at(0))
  })
})
