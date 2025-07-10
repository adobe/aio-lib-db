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

describe('DbClient tests', () => {
  let client
  let sessClient
  let nonSessClient

  beforeEach(async () => {
    const db = getDb()
    client = await db.connect()
    sessClient = db.axiosClientWithSession
    nonSessClient = db.axiosClientWithoutSession
    jest.clearAllMocks()
  })

  test('dbStats calls the appropriate endpoint', async () => {
    await client.dbStats()
    expect(nonSessClient).toHaveCalledServiceGet('v1/client/dbStats')
    expect(sessClient).not.toHaveCalledServiceGet('v1/client/dbStats')
  })

  test('close calls the appropriate endpoint', async () => {
    await client.close()
    expect(sessClient).toHaveCalledServicePost('v1/client/close', {})
    expect(nonSessClient).not.toHaveCalledServicePost('v1/client/close')
  })

  test('listCollections calls the appropriate endpoint', async () => {
    const filter = { name: 'test' }
    await client.listCollections(filter)
    expect(nonSessClient).toHaveCalledServicePost('v1/client/listCollections', { filter: filter })
    expect(sessClient).not.toHaveCalledServicePost('v1/client/listCollections')
  })

  test('createCollection calls the appropriate endpoint', async () => {
    const name = 'newCollection'
    await client.createCollection(name)
    expect(nonSessClient).toHaveCalledServicePost('v1/client/createCollection', { name: name })
    expect(sessClient).not.toHaveCalledServicePost('v1/client/createCollection')
  })
})
