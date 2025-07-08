const { getDb } = require("../testingUtils")
const { default: axios } = require('axios')
const { CURSOR_INIT_ERR_MESSAGE } = require("../../lib/constants")

const axiosClient = axios.create()

describe('FindCursor tests', () => {
  let collection

  beforeEach(async () => {
    const client = await getDb().connect()
    collection = client.collection('testCollection')
    jest.clearAllMocks()
  })

  test('request body is properly generated from chained methods', async () => {
    const cursor = collection.find()
      .filter({ field: { $gte: 'value3' } })
      .sort('field', -1)
      .project({ field: 1 })
      .limit(2)
      .skip(1)
      .batchSize(5)

    // Initialize the cursor to trigger the request
    await cursor.hasNext()

    expect(axiosClient).toHaveCalledServicePost(
      'v1/collection/testCollection/find',
      {
        filter: { field: { $gte: 'value3' } },
        options: {
          sort: { sort: 'field', direction: -1 },
          projection: { field: 1 },
          limit: 2,
          skip: 1,
          batchSize: 5
        }
      }
    )
  })

  test('chained functions cannot change cursor after it has been initialized', async () => {
    const cursor = collection.find()
    await cursor.hasNext()

    expect(() => cursor.filter({ field: { $gte: 'value3' } })).toThrow(CURSOR_INIT_ERR_MESSAGE)
    expect(() => cursor.sort('field', -1)).toThrow(CURSOR_INIT_ERR_MESSAGE)
    expect(() => cursor.project({ field: 1 })).toThrow(CURSOR_INIT_ERR_MESSAGE)
    expect(() => cursor.limit(2)).toThrow(CURSOR_INIT_ERR_MESSAGE)
    expect(() => cursor.skip(1)).toThrow(CURSOR_INIT_ERR_MESSAGE)
  })
})
