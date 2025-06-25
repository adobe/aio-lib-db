const { getDb } = require("../testingUtils")
const { default: axios } = require('axios')
const AbstractDbCursor = require("../../lib/AbstractDbCursor")
const { apiPost } = require("../../utils/apiRequest")
const { CURSOR_INIT_ERR_MESSAGE } = require("../../lib/constants")

const axiosClient = axios.create()
const TEST_CURSOR_ID = axios.TEST_CURSOR_ID

// The _firstRequest method is abstract in AbstractDbCursor, so we need to implement a test class
class TestCursor extends AbstractDbCursor {
  async _firstRequest() {
    return await apiPost(this._db, `collection/${this._collection}/find`, undefined, this._options)
  }
}

describe('AbstractDbCursor iteration tests', () => {
  let cursor

  beforeEach(async () => {
    const client = await getDb().connect()
    const collection = client.collection('testCollection')
    cursor = new TestCursor(collection.db, collection.name)
    jest.clearAllMocks()
  })

  test('cursor iteration using hasNext and next', async () => {
    let counter = 0
    while (await cursor.hasNext()) {
      const res = await cursor.next()
      expect(res).toHaveProperty('field', `value${++counter}`)
    }
    expect(counter).toBe(6)
    expect(axiosClient).toHaveCalledServicePost('v1/collection/testCollection/getMore', { cursorId: TEST_CURSOR_ID }, 1)
  })

  test('cursor does not call getMore() until after the first results have been consumed', async () => {
    expect(cursor.closed).toBe(false)
    expect(await cursor.hasNext()).toBe(true)
    expect(axiosClient).not.toHaveCalledServicePost('v1/collection/testCollection/getMore')

    // Consume the first batch
    await cursor.next()
    await cursor.next()
    await cursor.next()
    expect(axiosClient).not.toHaveCalledServicePost('v1/collection/testCollection/getMore')

    // Now hasNext() should trigger a getMore call
    expect(await cursor.hasNext()).toBe(true)
    expect(axiosClient).toHaveCalledServicePost('v1/collection/testCollection/getMore', { cursorId: TEST_CURSOR_ID }, 1)
  })

  test('cursor iteration using toArray()', async () => {
    const results = await cursor.toArray()
    expect(results).toHaveLength(6)
    for (let i = 0; i < results.length; i++) {
      expect(results[i]).toHaveProperty('field', `value${i + 1}`)
    }
    expect(axiosClient).toHaveCalledServicePost('v1/collection/testCollection/getMore', { cursorId: TEST_CURSOR_ID }, 1)
  })

  test('cursor iteration using for await...of', async () => {
    let counter = 0
    for await (const doc of cursor) {
      expect(doc).toHaveProperty('field', `value${++counter}`)
    }
    expect(counter).toBe(6)
    expect(axiosClient).toHaveCalledServicePost('v1/collection/testCollection/getMore', { cursorId: TEST_CURSOR_ID }, 1)
  })

  test('cursor iteration using stream without transformation', async () => {
    const stream = cursor.stream()
    let counter = 0
    for await (const doc of stream) {
      expect(doc).toHaveProperty('field', `value${++counter}`)
    }
    expect(counter).toBe(6)
    expect(axiosClient).toHaveCalledServicePost('v1/collection/testCollection/getMore', { cursorId: TEST_CURSOR_ID }, 1)
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
    expect(axiosClient).toHaveCalledServicePost('v1/collection/testCollection/getMore', { cursorId: TEST_CURSOR_ID }, 1)
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
    expect(axiosClient).toHaveCalledServicePost('v1/collection/testCollection/getMore', { cursorId: TEST_CURSOR_ID }, 1)
  })

  test('cursor iteration using events', async () => {
    let counter = 0
    cursor.on('data', (doc) => {
      expect(doc).toHaveProperty('field', `value${++counter}`)
    })
    // Wait for the stream to close
    await new Promise((resolve) => cursor.on('end', resolve))
    expect(counter).toBe(6)

    expect(axiosClient).toHaveCalledServicePost('v1/collection/testCollection/getMore', { cursorId: TEST_CURSOR_ID }, 1)
  })

  test('cursor.explain() immediately calls the api and closes the cursor', async () => {
    await cursor.explain()
    expect(axiosClient).toHaveCalledServicePost('v1/collection/testCollection/find', { options: { explain: true } })
    // After calling explain, the cursor should be closed and not usable
    expect(cursor.closed).toBe(true)
    expect(await cursor.hasNext()).toBe(false)
    expect(axiosClient).not.toHaveCalledServicePost('v1/collection/testCollection/getMore')
  })

  test('cursor.explain(), cursor.batchSize(), and cursor.map() cannot be called after initialization', async () => {
    await cursor.hasNext() // Initialize the cursor
    await expect(cursor.explain()).rejects.toThrow(CURSOR_INIT_ERR_MESSAGE)
    expect(() => cursor.batchSize(10)).toThrow(CURSOR_INIT_ERR_MESSAGE)
    expect(() => cursor.map(doc => doc)).toThrow(CURSOR_INIT_ERR_MESSAGE)
  })
})
