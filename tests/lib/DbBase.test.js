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
const { ALLOWED_REGIONS } = require("../../lib/constants")
const { apiGet, apiPost } = require("../../utils/apiRequest")

describe('DbBase tests', () => {
  let db
  let sessClient
  let nonSessClient

  beforeEach(async () => {
    db = getDb()
    sessClient = db.axiosClientWithSession
    nonSessClient = db.axiosClientWithoutSession
  })

  test('connect calls the appropriate endpoint', async () => {
    const res = await db.connect()
    expect(sessClient).toHaveCalledServicePost('v1/db/connect', {})
    expect(nonSessClient).not.toHaveCalledServicePost('v1/db/connect')
    expect(res).toHaveProperty('constructor.name', 'DbClient')
  })

  test('provisionRequest calls the appropriate endpoint', async () => {
    await db.provisionRequest()
    expect(nonSessClient).toHaveCalledServicePost('v1/db/provision/request')
    expect(sessClient).not.toHaveCalledServicePost('v1/db/provision/request')
  })

  test('provisionStatus calls the appropriate endpoint', async () => {
    await db.provisionStatus()
    expect(nonSessClient).toHaveCalledServicePost('v1/db/provision/status', {})
    expect(sessClient).not.toHaveCalledServicePost('v1/db/provision/status')
  })

  test('ping calls the appropriate endpoint', async () => {
    await db.ping()
    expect(nonSessClient).toHaveCalledServiceGet('v1/db/ping')
    expect(sessClient).not.toHaveCalledServiceGet('v1/db/ping')
  })

  test('serviceUrl is set based on region', async () => {
    for (const region of ALLOWED_REGIONS) {
      const dbInstance = await DbBase.init({ region: region, namespace: TEST_NAMESPACE, apikey: TEST_AUTH })
      const axiosClient = dbInstance.axiosClientWithoutSession
      expect(dbInstance.serviceUrl).toBe(`https://db.${region}.adobe.test`)
      await apiGet(dbInstance, 'db/ping')
      expect(axiosClient).toHaveCalledServiceGet(`https://db.${region}.adobe.test/v1/db/ping`)
      await apiPost(dbInstance, 'db/provision/status')
      expect(axiosClient).toHaveCalledServicePost(`https://db.${region}.adobe.test/v1/db/provision/status`)
    }

    // Test default region
    const defaultRegion = ALLOWED_REGIONS.at(0)
    const defaultDb = await DbBase.init({ namespace: TEST_NAMESPACE, apikey: TEST_AUTH })
    const axiosClient = defaultDb.axiosClientWithoutSession
    expect(defaultDb.serviceUrl).toBe(`https://db.${defaultRegion}.adobe.test`)
    await apiGet(defaultDb, 'db/ping')
    expect(axiosClient).toHaveCalledServiceGet(`https://db.${defaultRegion}.adobe.test/v1/db/ping`)
    await apiPost(defaultDb, 'db/provision/status')
    expect(axiosClient).toHaveCalledServicePost(`https://db.${defaultRegion}.adobe.test/v1/db/provision/status`)
  })

  test('serviceUrl is set based on environment', async () => {
    const defaultRegion = ALLOWED_REGIONS.at(0)
    const prodUrl = `https://db.${defaultRegion}.adobe.test`
    const stageUrl = `https://db-stage.${defaultRegion}.adobe.test`

    process.env.AIO_CLI_ENV = 'stage'
    const dbStage = await DbBase.init({ namespace: TEST_NAMESPACE, apikey: TEST_AUTH })
    const stageAxios = dbStage.axiosClientWithoutSession
    expect(dbStage.serviceUrl).toBe(stageUrl)
    await apiGet(dbStage, 'db/ping')
    expect(stageAxios).toHaveCalledServiceGet(`${stageUrl}/v1/db/ping`)
    await apiPost(dbStage, 'db/provision/status')
    expect(stageAxios).toHaveCalledServicePost(`${stageUrl}/v1/db/provision/status`)

    process.env.AIO_CLI_ENV = 'prod'
    const dbProd = await DbBase.init({ namespace: TEST_NAMESPACE, apikey: TEST_AUTH })
    const prodAxios = dbProd.axiosClientWithoutSession
    expect(dbProd.serviceUrl).toBe(prodUrl)
    await apiGet(dbProd, 'db/ping')
    expect(prodAxios).toHaveCalledServiceGet(`${prodUrl}/v1/db/ping`)
    await apiPost(dbProd, 'db/provision/status')
    expect(prodAxios).toHaveCalledServicePost(`${prodUrl}/v1/db/provision/status`)

    // Should default to prod if AIO_CLI_ENV is not set
    delete process.env.AIO_CLI_ENV
    const dbDefault = await DbBase.init({ namespace: TEST_NAMESPACE, apikey: TEST_AUTH })
    const defaultAxios = dbDefault.axiosClientWithoutSession
    expect(dbDefault.serviceUrl).toBe(prodUrl)
    await apiGet(dbDefault, 'db/ping')
    expect(defaultAxios).toHaveCalledServiceGet(`${prodUrl}/v1/db/ping`)
    await apiPost(dbDefault, 'db/provision/status')
    expect(defaultAxios).toHaveCalledServicePost(`${prodUrl}/v1/db/provision/status`)
  })

  test('serviceUrl can be overridden with AIO_DB_ENDPOINT environment variable', async () => {
    const customEndpoint = 'https://custom-db.adobe.test'
    process.env.AIO_DB_ENDPOINT = customEndpoint

    const dbCustom = await DbBase.init({ namespace: TEST_NAMESPACE, apikey: TEST_AUTH })
    const axiosClient = dbCustom.axiosClientWithoutSession
    expect(dbCustom.serviceUrl).toBe(customEndpoint)
    await apiGet(dbCustom, 'db/ping')
    expect(axiosClient).toHaveCalledServiceGet(`${customEndpoint}/v1/db/ping`)
    await apiPost(dbCustom, 'db/provision/status')
    expect(axiosClient).toHaveCalledServicePost(`${customEndpoint}/v1/db/provision/status`)
  })

  test('throws error for unsupported region', async () => {
    const unsupportedRegion = 'unsupported-region'
    await expect(DbBase.init({
      region: unsupportedRegion,
      namespace: TEST_NAMESPACE,
      apikey: TEST_AUTH
    })).rejects.toThrow(`Invalid region '${unsupportedRegion}'`)
  })
})
