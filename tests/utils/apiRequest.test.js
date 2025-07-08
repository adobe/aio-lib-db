const { getDb } = require("../testingUtils")
const { AxiosError } = jest.requireActual("axios")
const { apiGet } = require("../../utils/apiRequest")

describe('API Request Tests', () => {
  let axiosClient

  beforeEach(async () => {
    const db = getDb()
    axiosClient = db.axiosClientWithoutSession
    jest.clearAllMocks()
  })

  test('apiRequest attaches http code when error occurs', async () => {
    axiosClient.get.mockImplementationOnce(() => {
      return Promise.reject(new AxiosError(
        'Not Found',
        undefined,
        undefined,
        undefined,
        { data: { requestId: 'id', message: 'Not Found' }, status: 404 }
      ))
    })

    await expect(async () => {
      await apiGet(db, 'db/ping')
    }).toThrowErrorWithProperties({ httpStatusCode: 404 }, 'DbError')
  })

  test('apiRequest attaches http code when response is not successful', async () => {
    axiosClient.get.mockImplementationOnce(() => {
      return Promise.resolve({ data: { requestId: 'id', success: false, message: 'Request Failed' }, status: 200 })
    })

    await expect(async () => {
      await apiGet(db, 'db/ping')
    }).toThrowErrorWithProperties({ httpStatusCode: 200 }, 'DbError')
  })
})
