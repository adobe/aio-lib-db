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
const { getDb, TEST_NAMESPACE, TEST_AUTH } = require("../testingUtils")
const DbBase = require("../../lib/DbBase")
const { PROD_ENV, STAGE_ENV, ALLOWED_REGIONS } = require("../../lib/constants")
const { apiGet, apiPost } = require("../../utils/apiRequest")

describe('DbBase tests', () => {
  let db
  let nonSessClient

  beforeEach(async () => {
    db = getDb()
    nonSessClient = db.axiosClient
  })

  test('provisionRequest calls the appropriate endpoint', async () => {
    await db.provisionRequest()
    expect(nonSessClient).toHaveCalledServicePost('v1/db/provision/request')
    expect(await nonSessClient.getSessionCookies()).toEqual([])
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
    { env: STAGE_ENV, url: 'https://db-stage.<region>.adobe.test', regions: ALLOWED_REGIONS[STAGE_ENV] }
  ])('serviceUrl for $env environment is set based on region', async ({ env, url, regions }) => {
    if (env === 'default') {
      delete process.env.AIO_CLI_ENV
    }
    else {
      process.env.AIO_CLI_ENV = env
    }

    for (const region of regions) {
      const expectedUrl = url.replaceAll(/<region>/gi, region)
      const dbInstance = await DbBase.init({ region: region, namespace: TEST_NAMESPACE, apikey: TEST_AUTH })
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
    const defaultDb = await DbBase.init({ namespace: TEST_NAMESPACE, apikey: TEST_AUTH })
    const axiosClient = defaultDb.axiosClient
    expect(defaultDb.serviceUrl).toBe(expectedUrl)
    await apiGet(defaultDb, axiosClient, 'db/ping')
    expect(axiosClient).toHaveCalledServiceGet(`${expectedUrl}/v1/db/ping`)
    await apiPost(defaultDb, axiosClient, 'db/provision/status')
    expect(axiosClient).toHaveCalledServicePost(`${expectedUrl}/v1/db/provision/status`)
  })

  test('serviceUrl can be overridden with AIO_DB_ENDPOINT environment variable', async () => {
    const customEndpoint = 'https://custom-db.adobe.test'
    process.env.AIO_DB_ENDPOINT = customEndpoint

    const dbCustom = await DbBase.init({ namespace: TEST_NAMESPACE, apikey: TEST_AUTH })
    const axiosClient = dbCustom.axiosClient
    expect(dbCustom.serviceUrl).toBe(customEndpoint)
    await apiGet(dbCustom, axiosClient, 'db/ping')
    expect(axiosClient).toHaveCalledServiceGet(`${customEndpoint}/v1/db/ping`)
    await apiPost(dbCustom, axiosClient, 'db/provision/status')
    expect(axiosClient).toHaveCalledServicePost(`${customEndpoint}/v1/db/provision/status`)
  })

  test.each([
    { env: 'default', allowed: ALLOWED_REGIONS[PROD_ENV], otherEnvRegions: ALLOWED_REGIONS[STAGE_ENV] }, // default prod
    { env: PROD_ENV, allowed: ALLOWED_REGIONS[PROD_ENV], otherEnvRegions: ALLOWED_REGIONS[STAGE_ENV] },
    { env: STAGE_ENV, allowed: ALLOWED_REGIONS[STAGE_ENV], otherEnvRegions: ALLOWED_REGIONS[PROD_ENV] }
  ])('throws error only for unsupported regions in $env environment', async ({ env, allowed, otherEnvRegions }) => {
    if (env === 'default') {
      delete process.env.AIO_CLI_ENV
    }
    else {
      process.env.AIO_CLI_ENV = env
    }
    const unsupported = [
      `unsupported-${env}-region`,
      ...otherEnvRegions.filter(r => !allowed.includes(r))
    ]

    for (const r of allowed) {
      await expect(DbBase.init({ region: r, namespace: TEST_NAMESPACE, apikey: TEST_AUTH })).resolves
    }
    for (const r of unsupported) {
      await expect(
        DbBase.init({ region: r, namespace: TEST_NAMESPACE, apikey: TEST_AUTH })
      ).rejects.toThrow(`Invalid region '${r}'`)
    }
  })
})
