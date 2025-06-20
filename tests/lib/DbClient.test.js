const { getDb } = require("../testingUtils")
const { default: axios } = require('axios')

const axiosClient = axios.create()

describe('DbClient tests', () => {
  let client

  beforeEach(async () => {
    client = await getDb().connect()
    jest.clearAllMocks()
  })

  test('dbStats calls the appropriate endpoint', async () => {
    await client.dbStats()
    expect(axiosClient).toHaveCalledServiceGet('v1/client/dbStats')
  })

  test('close calls the appropriate endpoint', async () => {
    await client.close()
    expect(axiosClient).toHaveCalledServicePost('v1/client/close', {})
  })

  test('listCollections calls the appropriate endpoint', async () => {
    const filter = { name: 'test' }
    await client.listCollections(filter)
    expect(axiosClient).toHaveCalledServicePost('v1/client/listCollections', { filter: filter })
  })

  test('createCollection calls the appropriate endpoint', async () => {
    const name = 'newCollection'
    await client.createCollection(name)
    expect(axiosClient).toHaveCalledServicePost('v1/client/createCollection', { name: name })
  })
})
