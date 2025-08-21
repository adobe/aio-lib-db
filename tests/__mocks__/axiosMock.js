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
const { ENDPOINT_URL, REQUEST_ID_HEADER } = require('../../lib/constants')
const { Long, EJSON } = require("bson")
const { v6: uuidV6 } = require("uuid")
const { Cookie } = require("tough-cookie")

// Helper to construct the result object returned by an axios request
function buildResponseTemplate(body = {}) {
  const requestId = uuidV6()
  return {
    headers: { [REQUEST_ID_HEADER]: requestId },
    status: 200,
    data: {
      success: true,
      data: body,
      requestId
    }
  }
}

function getResponse(template, cookies = undefined) {
  // Have to deep clone the template to avoid issues with the original object being modified by a previous test
  const response = EJSON.parse(EJSON.stringify(template, { relaxed: false }), { relaxed: false })
  if (cookies && cookies.length > 0) {
    response.headers['Set-Cookie'] = cookies
  }
  return response
}

function throwErrorResponse(message, responseCode = 500) {
  const requestId = uuidV6()
  const response = {
    headers: {
      [REQUEST_ID_HEADER]: requestId
    },
    status: responseCode,
    data: {
      success: false,
      message,
      requestId
    }
  }
  const err = new Error(message)
  err.response = response
  throw err
}

const SESSION_COOKIE = 'adpsd-session-id'
const ENDPOINT_DOMAIN = ENDPOINT_URL.replace(/^https?:\/\//, '')

// Session configuration constants
const SESSION_CONFIGS = {
  START_SESSION: { sessionOnRequest: "reject", start: true },
  REQUIRE_SESSION: { sessionOnRequest: "required" },
  CLOSE_SESSION: { sessionOnRequest: "required", close: true },
  NO_SESSION: undefined
}

// Responses to return from endpoints expecting the corresponding type of data
const OBJECT_RESPONSE = buildResponseTemplate({ field: 'value' })
const ARRAY_RESPONSE = buildResponseTemplate([{ field: 'value1' }, { field: 'value2' }, { field: 'value3' }])
const NUMBER_RESPONSE = buildResponseTemplate(42)
const STRING_RESPONSE = buildResponseTemplate('testString')
const VOID_RESPONSE = buildResponseTemplate(undefined)

const TEST_CURSOR_ID = new Long('5461853363952707584')
const FIRST_CURSOR_RESPONSE = buildResponseTemplate({
  cursor: {
    id: TEST_CURSOR_ID,
    firstBatch: [{ field: 'value1' }, { field: 'value2' }, { field: 'value3' }]
  }
})
const LAST_CURSOR_RESPONSE = buildResponseTemplate({
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
    result: FIRST_CURSOR_RESPONSE,
    getSessionConfig: () => SESSION_CONFIGS.START_SESSION
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
    result: FIRST_CURSOR_RESPONSE,
    getSessionConfig: (body) => {
      // Aggregate endpoint doesn't use a session if explain is set to true
      if (body?.options?.explain) {
        return SESSION_CONFIGS.NO_SESSION
      }
      return SESSION_CONFIGS.START_SESSION
    }
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
    result: LAST_CURSOR_RESPONSE,
    getSessionConfig: () => SESSION_CONFIGS.REQUIRE_SESSION
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
    result: VOID_RESPONSE,
    getSessionConfig: () => SESSION_CONFIGS.CLOSE_SESSION
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

// Slice off everything up to this point before checking route
const ROUTE_START = ENDPOINT_URL.length + 1

class AxiosMock {
  constructor(config = undefined) {
    this.cookieJar = config?.httpAgent?.options?.cookies?.jar || config?.httpsAgent?.options?.cookies?.jar || undefined
  }

  interceptors = {
    response: {
      use: jest.fn((handler) => {
      })
    }
  }

  getCookieHeaders = async (url, sessionConfig) => {
    if (sessionConfig) {
      expect(this.cookieJar).toBeDefined()
    }
    if (!this.cookieJar) {
      expect(sessionConfig).toBeUndefined()
      return
    }

    const jar = this.cookieJar
    const hasCookie = (await jar.store.findCookie(ENDPOINT_DOMAIN, '/', SESSION_COOKIE)) !== undefined
    if (hasCookie && sessionConfig.sessionOnRequest === 'reject') {
      throwErrorResponse('Session already started', 403)
    }
    if (!hasCookie && sessionConfig.sessionOnRequest === 'required') {
      throwErrorResponse('Session cookie is missing', 400)
    }
    if (sessionConfig.start && !hasCookie) {
      await jar.setCookie(new Cookie({
        key: SESSION_COOKIE,
        value: uuidV6(),
        domain: ENDPOINT_DOMAIN
      }), ENDPOINT_URL)
    }
    if (sessionConfig.close) {
      await jar.store.removeCookie(ENDPOINT_DOMAIN, '/', SESSION_COOKIE)
    }
    return await jar.getSetCookieStrings(ENDPOINT_URL)
  }

  get = jest.fn(async (url, reqConfig) => {
    url = url.slice(ROUTE_START)
    let result
    let sessionConfig
    for (const r of GET_ENDPOINT_RESULTS) {
      if (r.route.test(url)) {
        result = r.result
        sessionConfig = r.getSessionConfig?.()
        break
      }
    }
    if (result !== undefined) {
      const cookies = await this.getCookieHeaders(url, sessionConfig)
      return getResponse(result, cookies)
    }
    throw new Error(`${url} did not match any mocked GET endpoint`)
  })

  post = jest.fn(async (url, body, reqConfig) => {
    url = url.slice(ROUTE_START)
    let result
    let sessionConfig
    for (const r of POST_ENDPOINT_RESULTS) {
      if (r.route.test(url)) {
        result = r.result
        const bodyParsed = body ? EJSON.parse(body, { relaxed: false }) : {}
        sessionConfig = r.getSessionConfig?.(bodyParsed)
        break
      }
    }
    if (result !== undefined) {
      const cookie = await this.getCookieHeaders(url, sessionConfig)
      return getResponse(result, cookie)
    }
    throw new Error(`${url} did not match any mocked POST endpoint`)
  })

  // Helper function to compare cookies in tests
  getSessionCookies = jest.fn(async () => {
    if (!this.cookieJar) {
      return []
    }
    const cookies = (await this.cookieJar.getSetCookieStrings(ENDPOINT_URL)) || []
    // Filter cookies to only include the session cookie and return only the name=value part
    return cookies?.filter(c => c.startsWith(`${SESSION_COOKIE}=`)).map(c => c.split(';')[0])
  })
}

module.exports = {
  default: {
    create: jest.fn(config => new AxiosMock(config))
  },
  // Export this value so cursor tests make sure to use the same ID as mocked results
  // Can't put in testingUtils because it would cause circular dependency issues
  TEST_CURSOR_ID
}
