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
const { AxiosError } = jest.requireActual("axios")
const { apiGet, apiPost } = require("../../utils/apiRequest")

describe('API Request Tests', () => {
  let db

  beforeEach(async () => {
    db = getDb()
    jest.clearAllMocks()
  })

  test('apiGet uses access token and makes request', async () => {
    db.axiosClient.get.mockResolvedValue({
      data: { success: true, data: { result: 'ok' } }
    })

    const result = await apiGet(db, db.axiosClient, 'db/ping')

    expect(db.axiosClient.get).toHaveBeenCalled()
    expect(result).toEqual({ result: 'ok' })
  })

  test('apiPost uses access token and makes request', async () => {
    db.axiosClient.post.mockResolvedValue({
      data: { success: true, data: { inserted: 1 } }
    })

    const result = await apiPost(db, db.axiosClient, 'collection/test/insertOne', { doc: { a: 1 } })

    expect(db.axiosClient.post).toHaveBeenCalled()
    expect(result).toEqual({ inserted: 1 })
  })

  test('apiRequest attaches http code when error occurs', async () => {
    db.axiosClient.get.mockImplementationOnce(() => {
      return Promise.reject(new AxiosError(
        'Not Found',
        undefined,
        undefined,
        undefined,
        { data: { requestId: 'id', message: 'Not Found' }, status: 404 }
      ))
    })

    await expect(async () => {
      await apiGet(db, db.axiosClient, 'db/ping')
    }).toThrowErrorWithProperties({ httpStatusCode: 404 }, 'DbError')
  })

  test('apiRequest attaches http code when response is not successful', async () => {
    db.axiosClient.get.mockImplementationOnce(() => {
      return Promise.resolve({ data: { requestId: 'id', success: false, message: 'Request Failed' }, status: 200 })
    })

    await expect(async () => {
      await apiGet(db, db.axiosClient, 'db/ping')
    }).toThrowErrorWithProperties({ httpStatusCode: 200 }, 'DbError')
  })
})
