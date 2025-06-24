const { getDb } = require("../testingUtils")
const { default: axios } = require('axios')

const axiosClient = axios.create()
const TEST_CURSOR_ID = axios.TEST_CURSOR_ID

describe('DbCursor tests', () => {
  let collection

  beforeEach(async () => {
    const client = await getDb().connect()
    collection = client.collection('testCollection')
    jest.clearAllMocks()
  })

  test('cursor iteration using hasNext and next', async () => {
    const cursor = await collection.find({})
    let counter = 0
    while (await cursor.hasNext()) {
      const res = await cursor.next()
      expect(res).toHaveProperty('field', `value${++counter}`)
    }
    expect(counter).toBe(6)
    expect(axiosClient).toHaveCalledServicePost(
      'v1/collection/testCollection/getMore',
      { cursorId: TEST_CURSOR_ID }
    )
  })

  test('cursor iteration using toArray()', async () => {
    const cursor = await collection.find({})
    const results = await cursor.toArray()
    expect(results).toHaveLength(6)
    for (let i = 0; i < results.length; i++) {
      expect(results[i]).toHaveProperty('field', `value${i + 1}`)
    }
    expect(axiosClient).toHaveCalledServicePost(
      'v1/collection/testCollection/getMore',
      { cursorId: TEST_CURSOR_ID }
    )
  })

  test('cursor iteration using for await...of', async () => {
    const cursor = await collection.find({})
    let counter = 0
    for await (const doc of cursor) {
      expect(doc).toHaveProperty('field', `value${++counter}`)
    }
    expect(counter).toBe(6)
    expect(axiosClient).toHaveCalledServicePost(
      'v1/collection/testCollection/getMore',
      { cursorId: TEST_CURSOR_ID }
    )
  })

  test('cursor iteration using stream with transformation', async () => {
    const cursor = await collection.find({})
    const stream = cursor.stream((doc) => {
      const doubled = Number(doc.field.slice(-1)) * 2
      return { field: `field${doubled}` }
    })
    let counter = 0
    for await (const doc of stream) {
      expect(doc).toHaveProperty('field', `field${++counter * 2}`)
    }
    expect(counter).toBe(6)
    expect(axiosClient).toHaveCalledServicePost(
      'v1/collection/testCollection/getMore',
      { cursorId: TEST_CURSOR_ID }
    )
  })

  test('cursor iteration using events', async () => {
    const cursor = await collection.find({})
    let counter = 0
    cursor.on('data', (doc) => {
      expect(doc).toHaveProperty('field', `value${++counter}`)
    })
    // Wait for the stream to close
    await new Promise((resolve) => cursor.on('end', resolve))
    expect(counter).toBe(6)

    expect(axiosClient).toHaveCalledServicePost(
      'v1/collection/testCollection/getMore',
      { cursorId: TEST_CURSOR_ID }
    )
  })
})
