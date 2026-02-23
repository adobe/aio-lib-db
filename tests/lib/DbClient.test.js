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
const { getDb, getAxiosFromCursor } = require("../testingUtils")
const AbstractDbCursor = require("../../lib/AbstractDbCursor")
const { apiPost } = require("../../utils/apiRequest")

// The _firstRequest method is abstract in AbstractDbCursor, so we need to implement a test class
class TestCursor extends AbstractDbCursor {
  async _firstRequest() {
    return await apiPost(this._db, this._axiosClient, `collection/${this._collection}/find`, undefined, this._options)
  }
}

describe('DbClient tests', () => {
  let client
  let nonSessClient

  beforeEach(async () => {
    const db = getDb()
    client = await db.connect()
    nonSessClient = db.axiosClient
    jest.clearAllMocks()
  })

  test('dbStats calls the appropriate endpoint', async () => {
    await client.dbStats()
    expect(nonSessClient).toHaveCalledServicePost('v1/client/dbStats')

    await client.dbStats({ scale: 1024 })
    expect(nonSessClient).toHaveCalledServicePost('v1/client/dbStats', { options: { scale: 1024 } })
  })

  test('orgStats calls the appropriate endpoint', async () => {
    await client.orgStats()
    expect(nonSessClient).toHaveCalledServicePost('v1/client/orgStats')

    await client.orgStats({ scale: 1024 })
    expect(nonSessClient).toHaveCalledServicePost('v1/client/orgStats', { options: { scale: 1024 } })
  })

  test('close calls the appropriate endpoint for all registered cursors and deregisters them', async () => {
    const cursor1 = new TestCursor(client.db, client, 'testCollection1', {})
    const cursor2 = new TestCursor(client.db, client, 'testCollection2', {})
    const cursor3 = new TestCursor(client.db, client, 'testCollection3', {})
    const cursorAxios1 = getAxiosFromCursor(cursor1)
    const cursorAxios2 = getAxiosFromCursor(cursor2)
    const cursorAxios3 = getAxiosFromCursor(cursor3)

    // Open the cursors
    await cursor1.hasNext()
    await cursor2.hasNext()
    await cursor3.hasNext()
    expect(client._activeCursors).toHaveProperty('size', 3)

    await client.close()

    expect(cursorAxios1).toHaveCalledServicePost('v1/client/close')
    expect(cursorAxios2).toHaveCalledServicePost('v1/client/close')
    expect(cursorAxios3).toHaveCalledServicePost('v1/client/close')
    expect(nonSessClient).not.toHaveCalledServicePost('v1/client/close')
    expect(client._activeCursors).toHaveProperty('size', 0)
  })

  test('listCollections calls the appropriate endpoint', async () => {
    const filter = { name: 'test' }
    await client.listCollections(filter)
    expect(nonSessClient).toHaveCalledServicePost('v1/client/listCollections', { filter: filter })
    expect(await nonSessClient.getSessionCookies()).toEqual([])
  })

  test('createCollection calls the appropriate endpoint', async () => {
    const name = 'newCollection'
    await client.createCollection(name)
    expect(nonSessClient).toHaveCalledServicePost('v1/client/createCollection', { name: name })
    expect(await nonSessClient.getSessionCookies()).toEqual([])
  })
})
