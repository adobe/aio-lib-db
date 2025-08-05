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
const { TEST_CURSOR_ID } = require('../__mocks__/axiosMock')
const AbstractDbCursor = require("../../lib/AbstractDbCursor")
const { apiPost } = require("../../utils/apiRequest")

// The _firstRequest method is abstract in AbstractDbCursor, so we need to implement a test class
class TestCursor extends AbstractDbCursor {
  async _firstRequest() {
    return await apiPost(this._db, this._axiosClient, `collection/${this._collection}/find`, undefined, this._options)
  }
}

class TestCursorWithError extends AbstractDbCursor {
  async _firstRequest() {
    return await apiPost(this._db, this._axiosClient, `collection/${this._collection}/find`, undefined, this._options)
  }

  async _getMore() {
    // Simulate an error during getMore
    await apiPost(
      this._db,
      this._axiosClient,
      `collection/${this._collection}/getMore`,
      { cursorId: TEST_CURSOR_ID },
      this._options
    )
    throw new Error('DANGER, WILL ROBINSON!')
  }
}

describe('AbstractDbCursor iteration tests', () => {
  let cursor
  let sessClient
  let nonSessClient
  let dbClient
  let collection

  beforeEach(async () => {
    dbClient = await getDb().connect()
    collection = dbClient.collection('testCollection')
    cursor = new TestCursor(collection.db, collection.client, collection.name, {})
    sessClient = getAxiosFromCursor(cursor)
    nonSessClient = collection.db.axiosClient
    jest.clearAllMocks()
  })

  test('cursor does not initialize or register until the first request for results', async () => {
    expect(cursor._initialized).toBe(false)
    expect(cursor.id).not.toBeDefined()
    expect(sessClient).not.toHaveCalledServicePost('v1/collection/testCollection/find')
    expect(dbClient._activeCursors).toHaveProperty('size', 0)
    expect(await sessClient.getSessionCookies()).toHaveLength(0)

    await cursor.hasNext()

    expect(cursor._initialized).toBe(true)
    expect(cursor.id).toBeDefined()
    expect(sessClient).toHaveCalledServicePost('v1/collection/testCollection/find')
    expect(dbClient._activeCursors).toHaveProperty('size', 1)
    expect(await sessClient.getSessionCookies()).toHaveLength(1)
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
    const bufferLength = cursor._buffer.length
    for (let i = 0; i < bufferLength; i++) {
      await cursor.next()
    }
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

    let endingEvent
    // Wait for the stream to close
    await new Promise((resolve) => {
      cursor.once('end', () => { if (!endingEvent) { endingEvent = 'ending event: end'; return resolve() } })
      cursor.once('error', () => { if (!endingEvent) { endingEvent = 'ending event: error'; return resolve() } })
    })

    expect(endingEvent).toBe('ending event: end')
    expect(counter).toBe(6)

    expect(sessClient).toHaveCalledServicePost('v1/collection/testCollection/getMore', { cursorId: TEST_CURSOR_ID }, 1)
    expect(nonSessClient).not.toHaveCalledServicePost('v1/collection/testCollection/getMore')
  })

  test('close() calls the close endpoint, closes the session, deregisters the cursor, and emits close', async () => {
    let closeEventEmitted = false
    cursor.once('close', () => {
      closeEventEmitted = true
    })

    // open the cursor
    await cursor.hasNext()

    expect(sessClient).toHaveCalledServicePost('v1/collection/testCollection/find')
    expect(dbClient._activeCursors).toHaveProperty('size', 1)
    expect(closeEventEmitted).not.toBe(true)
    expect(await sessClient.getSessionCookies()).toHaveLength(1)

    await cursor.close()

    expect(sessClient).toHaveCalledServicePost('v1/client/close')
    expect(nonSessClient).not.toHaveCalledServicePost('v1/client/close')
    expect(cursor._sessionClosed).toBe(true)
    expect(dbClient._activeCursors).toHaveProperty('size', 0)
    expect(closeEventEmitted).toBe(true)
    expect(await sessClient.getSessionCookies()).toHaveLength(0)
  })

  test('cursor closes session when the end of results is reached', async () => {
    let closeEventEmitted = false
    cursor.once('close', () => {
      closeEventEmitted = true
    })
    await cursor.hasNext()
    expect(cursor._sessionClosed).toBe(false)

    await cursor.toArray()
    expect(sessClient).toHaveCalledServicePost('v1/client/close')
    expect(cursor._sessionClosed).toBe(true)
    expect(dbClient._activeCursors).toHaveProperty('size', 0)
    expect(closeEventEmitted).toBe(true)
    expect(await sessClient.getSessionCookies()).toHaveLength(0)
  })

  test('calling close() before reaching the end of results stops iteration and clears the buffer', async () => {
    expect(await cursor.hasNext()).toBe(true)
    expect(cursor._buffer.length).toBeGreaterThan(0)
    expect(cursor._sessionClosed).toBe(false)

    await cursor.close()
    expect(cursor._sessionClosed).toBe(true)

    expect(cursor._buffer.length).toBe(0)
    expect(await cursor.hasNext()).toBe(false)
    expect(await cursor.next()).toBeNull()
    expect(sessClient).not.toHaveCalledServicePost('v1/collection/testCollection/getMore')
  })

  test('cursor closes session when an error occurs while iterating', async () => {
    let closeEventEmitted = false
    const errorCursor = new TestCursorWithError(collection.db, dbClient, collection.name, {})
    errorCursor.once('close', () => {
      closeEventEmitted = true
    })
    const sessClient = getAxiosFromCursor(errorCursor)

    await errorCursor.hasNext()
    const bufferLength = errorCursor._buffer.length
    // Consume the buffer so the following next() call hits getMore and the mock triggers an error
    for (let i = 0; i < bufferLength; i++) {
      await errorCursor.next()
    }
    expect(sessClient).not.toHaveCalledServicePost('v1/collection/testCollection/getMore')

    await expect(errorCursor.next()).rejects.toThrow('DANGER, WILL ROBINSON!')
    expect(sessClient).toHaveCalledServicePost('v1/collection/testCollection/getMore')

    expect(sessClient).toHaveCalledServicePost('v1/client/close')
    expect(errorCursor._sessionClosed).toBe(true)
    expect(dbClient._activeCursors).toHaveProperty('size', 0)
    expect(closeEventEmitted).toBe(true)
    expect(await sessClient.getSessionCookies()).toHaveLength(0)
  })

  test('cursor stops iteration when an error occurs', async () => {
    const errorCursor = new TestCursorWithError(collection.db, dbClient, collection.name, {})
    const sessClient = getAxiosFromCursor(errorCursor)

    await errorCursor.hasNext()
    const bufferLength = errorCursor._buffer.length
    // Consume the buffer so the following next() call hits getMore and the mock triggers an error
    for (let i = 0; i < bufferLength; i++) {
      await errorCursor.next()
    }
    expect(errorCursor._sessionClosed).toBe(false)

    await expect(errorCursor.next()).rejects.toThrow('DANGER, WILL ROBINSON!')
    expect(sessClient).toHaveCalledServicePost('v1/collection/testCollection/getMore')
    expect(errorCursor._sessionClosed).toBe(true)
    expect(await errorCursor.hasNext()).toBe(false)
    expect(await errorCursor.next()).toBeNull()
  })

  test('opening multiple cursors use different session cookies for each', async () => {
    const cursor1 = new TestCursor(collection.db, dbClient, collection.name, {})
    const cursor2 = new TestCursor(collection.db, dbClient, collection.name, {})
    const axios1 = getAxiosFromCursor(cursor1)
    const axios2 = getAxiosFromCursor(cursor2)
    expect(axios1).not.toBe(axios2)

    // Opening cursor1 should not open cursor2
    await cursor1.hasNext()
    expect(axios1).toHaveCalledServicePost('v1/collection/testCollection/find')
    expect(axios2).not.toHaveCalledServicePost('v1/collection/testCollection/find')

    await cursor2.hasNext()
    const cookies1 = await axios1.getSessionCookies()
    expect(cookies1).toHaveLength(1)
    const cookies2 = await axios2.getSessionCookies()
    expect(cookies2).toHaveLength(1)
    expect(cookies1[0]).not.toEqual(cookies2[0])
  })
})
