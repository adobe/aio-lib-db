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
const { getDb } = require("../testingUtils")

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
    const region = 'us-west-1'
    await db.provisionRequest({ region: region })
    expect(nonSessClient).toHaveCalledServicePost('v1/db/provision/request', { region: region })
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
})
