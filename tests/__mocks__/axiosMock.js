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
const { Long, EJSON } = require("bson")
const { v6: uuidV6 } = require("uuid")
const { HttpCookieAgent, HttpsCookieAgent } = require("http-cookie-agent/http")

// Helper to construct the result object returned by an axios request
function buildResponse(body = {}) {
  return {
    headers: {
      REQUEST_ID_HEADER: uuidV6()
    },
    data: {
      success: true,
      data: body
    }
  }
}

function deepClone(obj) {
  return EJSON.parse(EJSON.stringify(obj, { relaxed: false }), { relaxed: false })
}

// Responses to return from endpoints expecting the corresponding type of data
const OBJECT_RESPONSE = buildResponse({ field: 'value' })
const ARRAY_RESPONSE = buildResponse([{ field: 'value1' }, { field: 'value2' }, { field: 'value3' }])
const NUMBER_RESPONSE = buildResponse(42)
const STRING_RESPONSE = buildResponse('testString')
const VOID_RESPONSE = buildResponse(undefined)

const TEST_CURSOR_ID = new Long('5461853363952707584')
const FIRST_CURSOR_RESPONSE = buildResponse({
  cursor: {
    id: TEST_CURSOR_ID,
    firstBatch: [{ field: 'value1' }, { field: 'value2' }, { field: 'value3' }]
  }
})
const LAST_CURSOR_RESPONSE = buildResponse({
  cursor: {
    id: 0,
    nextBatch: [{ field: 'value4' }, { field: 'value5' }, { field: 'value6' }]
  }
})

// Associate results with corresponding endpoints
const GET_ENDPOINT_RESULTS = [
  {
    route: RegExp(`^v1/client/dbStats$`),
    result: OBJECT_RESPONSE
  },
  {
    route: RegExp(`^v1/db/ping$`),
    result: STRING_RESPONSE
  }
]

const POST_ENDPOINT_RESULTS = [
  {
    route: RegExp(`^v1/db/connect$`),
    result: VOID_RESPONSE
  },
  {
    route: RegExp(`^v1/collection/[^/]+/getIndexes$`),
    result: ARRAY_RESPONSE
  },
  {
    route: RegExp(`^v1/collection/[^/]+/createIndex$`),
    result: OBJECT_RESPONSE
  },
  {
    route: RegExp(`^v1/collection/[^/]+/dropIndex$`),
    result: OBJECT_RESPONSE
  },
  {
    route: RegExp(`^v1/collection/[^/]+/bulkWrite$`),
    result: OBJECT_RESPONSE
  },
  {
    route: RegExp(`^v1/collection/[^/]+/find$`),
    result: FIRST_CURSOR_RESPONSE
  },
  {
    route: RegExp(`^v1/collection/[^/]+/insertOne$`),
    result: OBJECT_RESPONSE
  },
  {
    route: RegExp(`^v1/collection/[^/]+/insertMany$`),
    result: OBJECT_RESPONSE
  },
  {
    route: RegExp(`^v1/collection/[^/]+/updateOne$`),
    result: OBJECT_RESPONSE
  },
  {
    route: RegExp(`^v1/collection/[^/]+/updateMany$`),
    result: OBJECT_RESPONSE
  },
  {
    route: RegExp(`^v1/collection/[^/]+/replaceOne$`),
    result: OBJECT_RESPONSE
  },
  {
    route: RegExp(`^v1/collection/[^/]+/findOneAndUpdate$`),
    result: OBJECT_RESPONSE
  },
  {
    route: RegExp(`^v1/collection/[^/]+/findOneAndReplace$`),
    result: OBJECT_RESPONSE
  },
  {
    route: RegExp(`^v1/collection/[^/]+/findOneAndDelete$`),
    result: OBJECT_RESPONSE
  },
  {
    route: RegExp(`^v1/collection/[^/]+/findArray$`),
    result: ARRAY_RESPONSE
  },
  {
    route: RegExp(`^v1/collection/[^/]+/deleteOne$`),
    result: OBJECT_RESPONSE
  },
  {
    route: RegExp(`^v1/collection/[^/]+/deleteMany$`),
    result: OBJECT_RESPONSE
  },
  {
    route: RegExp(`^v1/collection/[^/]+/countDocuments$`),
    result: NUMBER_RESPONSE
  },
  {
    route: RegExp(`^v1/collection/[^/]+/aggregate$`),
    result: FIRST_CURSOR_RESPONSE
  },
  {
    route: RegExp(`^v1/collection/[^/]+/findOne$`),
    result: OBJECT_RESPONSE
  },
  {
    route: RegExp(`^v1/collection/[^/]+/distinct$`),
    result: ARRAY_RESPONSE
  },
  {
    route: RegExp(`^v1/collection/[^/]+/estimatedDocumentCount$`),
    result: NUMBER_RESPONSE
  },
  {
    route: RegExp(`^v1/collection/[^/]+/drop$`),
    result: VOID_RESPONSE
  },
  {
    route: RegExp(`^v1/collection/[^/]+/renameCollection$`),
    result: VOID_RESPONSE
  },
  {
    route: RegExp(`^v1/collection/[^/]+/stats$`),
    result: OBJECT_RESPONSE
  },
  {
    route: RegExp(`^v1/collection/[^/]+/getMore$`),
    result: LAST_CURSOR_RESPONSE
  },
  {
    route: RegExp(`^v1/client/createCollection$`),
    result: VOID_RESPONSE
  },
  {
    route: RegExp(`^v1/client/listCollections$`),
    result: ARRAY_RESPONSE
  },
  {
    route: RegExp(`^v1/client/close$`),
    result: VOID_RESPONSE
  },
  {
    route: RegExp(`^v1/db/provision/request$`),
    result: OBJECT_RESPONSE
  },
  {
    route: RegExp(`^v1/db/provision/status$`),
    result: OBJECT_RESPONSE
  }
]

function getResponse(url, method) {
  const route = url.match(/^(https?:\/\/[^/]+\/)?(?<route>.*)/).groups.route // Remove base url if present
  const methodResults = method === 'GET' ? GET_ENDPOINT_RESULTS : POST_ENDPOINT_RESULTS
  const result = methodResults.find(r => r.route.test(route))?.result
  if (result !== undefined) {
    // Have to deep clone the result to avoid issues with the original object being modified by a previous test
    return new Promise((resolve) => resolve(deepClone(result)))
  }
  throw new Error(`${url} did not match any known ${method} endpoint`)
}

class AxiosMock {
  hasSession = false

  interceptors = {
    response: {
      use: jest.fn((handler) => {
      })
    }
  }

  get = jest.fn(async (url, reqConfig) => getResponse(url, 'GET'))
  post = jest.fn(async (url, body, reqConfig) => getResponse(url, 'POST'))
}

let mockSessionClient
let mockClientWithoutSession
module.exports = {
  default: {
    create: jest.fn((config) => {
      if (config?.httpAgent instanceof HttpCookieAgent || config?.httpsAgent instanceof HttpsCookieAgent) {
        if (!mockSessionClient) {
          mockSessionClient = new AxiosMock()
          mockSessionClient.hasSession = true
        }
        return mockSessionClient
      }
      if (!mockClientWithoutSession) {
        mockClientWithoutSession = new AxiosMock()
      }
      return mockClientWithoutSession
    })
  },
  // Export this value so cursor tests make sure to use the same ID as mocked results
  // Can't put in testingUtils because it would cause circular dependency issues
  TEST_CURSOR_ID
}
