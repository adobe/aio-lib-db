const { getDb } = require("../testingUtils")
const { default: axios } = require('axios')

const axiosClient = axios.create()

describe('DbBase tests', () => {
  let db

  beforeEach(async () => {
    db = getDb()
  })

  test('connect calls the appropriate endpoint', async () => {
    const res = await db.connect()
    expect(axiosClient).toHaveCalledServicePost('v1/db/connect', {})
    expect(res).toHaveProperty('constructor.name', 'DbClient')
  })

  test('provisionRequest calls the appropriate endpoint', async () => {
    const region = 'us-west-1'
    await db.provisionRequest({ region: region })
    expect(axiosClient).toHaveCalledServicePost('v1/db/provision/request', { region: region })
  })

  test('provisionStatus calls the appropriate endpoint', async () => {
    await db.provisionStatus()
    expect(axiosClient).toHaveCalledServicePost('v1/db/provision/status', {})
  })

  test('ping calls the appropriate endpoint', async () => {
    await db.ping()
    expect(axiosClient).toHaveCalledServiceGet('v1/db/ping')
  })
})
