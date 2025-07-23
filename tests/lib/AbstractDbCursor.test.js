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
const { TEST_CURSOR_ID } = require('../__mocks__/axiosMock')
const AbstractDbCursor = require("../../lib/AbstractDbCursor")
const { apiPost } = require("../../utils/apiRequest")
const { CURSOR_INIT_ERR_MESSAGE } = require("../../lib/constants")

// The _firstRequest method is abstract in AbstractDbCursor, so we need to implement a test class
class TestCursor extends AbstractDbCursor {
  async _firstRequest() {
    return await apiPost(this._db, `collection/${this._collection}/find`, undefined, this._options, true)
  }
}

describe('AbstractDbCursor iteration tests', () => {
  let cursor
  let sessClient
  let nonSessClient

  beforeEach(async () => {
    const client = await getDb().connect()
    const collection = client.collection('testCollection')
    cursor = new TestCursor(collection.db, collection.name, {})
    sessClient = collection.db.axiosClientWithSession
    nonSessClient = collection.db.axiosClientWithoutSession
    jest.clearAllMocks()
  })

  test('cursor iteration using hasNext and next', async () => {
    let counter = 0
    while (await cursor.hasNext()) {
      const res = await cursor.next()
      expect(res).toHaveProperty('field', `value${++counter}`)
    }
    expect(counter).toBe(6)
    expect(sessClient).toHaveCalledServicePost('v1/collection/testCollection/getMore', { cursorId: TEST_CURSOR_ID }, 1)
    expect(nonSessClient).not.toHaveCalledServicePost('v1/collection/testCollection/getMore')
  })

  test('cursor does not call getMore() until after the first results have been consumed', async () => {
    expect(cursor.closed).toBe(false)
    expect(await cursor.hasNext()).toBe(true)
    expect(sessClient).not.toHaveCalledServicePost('v1/collection/testCollection/getMore')

    // Consume the first batch
    await cursor.next()
    await cursor.next()
    await cursor.next()
    expect(sessClient).not.toHaveCalledServicePost('v1/collection/testCollection/getMore')

    // Now hasNext() should trigger a getMore call
    expect(await cursor.hasNext()).toBe(true)
    expect(sessClient).toHaveCalledServicePost('v1/collection/testCollection/getMore', { cursorId: TEST_CURSOR_ID }, 1)
    expect(nonSessClient).not.toHaveCalledServicePost('v1/collection/testCollection/getMore')
  })

  test('cursor iteration using toArray()', async () => {
    const results = await cursor.toArray()
    expect(results).toHaveLength(6)
    for (let i = 0; i < results.length; i++) {
      expect(results[i]).toHaveProperty('field', `value${i + 1}`)
    }
    expect(sessClient).toHaveCalledServicePost('v1/collection/testCollection/getMore', { cursorId: TEST_CURSOR_ID }, 1)
    expect(nonSessClient).not.toHaveCalledServicePost('v1/collection/testCollection/getMore')
  })

  test('cursor iteration using for await...of', async () => {
    let counter = 0
    for await (const doc of cursor) {
      expect(doc).toHaveProperty('field', `value${++counter}`)
    }
    expect(counter).toBe(6)
    expect(sessClient).toHaveCalledServicePost('v1/collection/testCollection/getMore', { cursorId: TEST_CURSOR_ID }, 1)
    expect(nonSessClient).not.toHaveCalledServicePost('v1/collection/testCollection/getMore')
  })

  test('cursor iteration using stream without transformation', async () => {
    const stream = cursor.stream()
    let counter = 0
    for await (const doc of stream) {
      expect(doc).toHaveProperty('field', `value${++counter}`)
    }
    expect(counter).toBe(6)
    expect(sessClient).toHaveCalledServicePost('v1/collection/testCollection/getMore', { cursorId: TEST_CURSOR_ID }, 1)
    expect(nonSessClient).not.toHaveCalledServicePost('v1/collection/testCollection/getMore')
  })

  test('cursor iteration using stream with transformation', async () => {
    const stream = cursor.stream((doc) => {
      const doubled = Number(doc.field.slice(-1)) * 2
      return { field: `value${doubled}` }
    })
    let counter = 0
    for await (const doc of stream) {
      expect(doc).toHaveProperty('field', `value${++counter * 2}`)
    }
    expect(counter).toBe(6)
    expect(sessClient).toHaveCalledServicePost('v1/collection/testCollection/getMore', { cursorId: TEST_CURSOR_ID }, 1)
    expect(nonSessClient).not.toHaveCalledServicePost('v1/collection/testCollection/getMore')
  })

  test('cursor iteration with transformation using .map()', async () => {
    cursor.map((doc) => {
      const doubled = Number(doc.field.slice(-1)) * 2
      return { field: `value${doubled}` }
    })
    const results = await cursor.toArray()
    expect(results).toHaveLength(6)
    for (let i = 0; i < results.length; i++) {
      expect(results[i]).toHaveProperty('field', `value${(i + 1) * 2}`)
    }
    expect(sessClient).toHaveCalledServicePost('v1/collection/testCollection/getMore', { cursorId: TEST_CURSOR_ID }, 1)
    expect(nonSessClient).not.toHaveCalledServicePost('v1/collection/testCollection/getMore')
  })

  test('cursor iteration using events', async () => {
    let counter = 0
    cursor.on('data', (doc) => {
      expect(doc).toHaveProperty('field', `value${++counter}`)
    })
    // Wait for the stream to close
    await new Promise((resolve) => cursor.on('end', resolve))
    expect(counter).toBe(6)

    expect(sessClient).toHaveCalledServicePost('v1/collection/testCollection/getMore', { cursorId: TEST_CURSOR_ID }, 1)
    expect(nonSessClient).not.toHaveCalledServicePost('v1/collection/testCollection/getMore')
  })
})
