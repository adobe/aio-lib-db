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
