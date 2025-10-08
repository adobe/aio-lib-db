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
const { default: axios } = require("axios-old")
const { CookieJar } = require("tough-cookie")
const { HttpCookieAgent, HttpsCookieAgent } = require("http-cookie-agent/http")
const { cleanParse } = require("./ejsonHandler")

/**
 * Use EJSON instead of JSON and clean primitive values
 *
 * @param {AxiosResponse} response
 * @returns {AxiosResponse}
 */
function jsonToEjson(response) {
  if (/^application\/json/.test(response.headers["content-type"])) {
    response.data = cleanParse(response.data)
  }
  return response
}

/**
 * Instantiate an Axios client with optional session support
 *
 * @param withSession
 * @return {AxiosInstance}
 */
function getAxiosClient(withSession = false) {
  let client

  if (withSession) {
    const jar = new CookieJar()
    client = axios.create({
      httpAgent: new HttpCookieAgent({ cookies: { jar } }),
      httpsAgent: new HttpsCookieAgent({ cookies: { jar } })
    })
  }
  else {
    client = axios.create()
  }

  // Parse 20x results using EJSON instead of JSON
  client.interceptors.response.use(jsonToEjson)
  return client
}

module.exports = {
  getAxiosClient
}
