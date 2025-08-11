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
require('dotenv/config')
const { getCliEnv } = require('@adobe/aio-lib-env')

const RUNTIME_HEADER = 'x-runtime-namespace'
const REQUEST_ID_HEADER = 'x-request-id'

const CURSOR_INIT_ERR_MESSAGE = 'Cursor has already been initialized, cannot modify request.'

const PROD_ENV = 'prod'
const STAGE_ENV = 'stage'

const ALLOWED_REGIONS = [ // First region is the default
  'amer',
  'emea',
  'apac'
]

const ENDPOINTS = {
  // TODO: Replace with actual endpoints
  [PROD_ENV]: 'https://db.<region>.adobe.io',
  [STAGE_ENV]: 'https://db-stage.<region>.adobe.io'
}

module.exports = {
  RUNTIME_HEADER,
  REQUEST_ID_HEADER,
  CURSOR_INIT_ERR_MESSAGE,
  PROD_ENV,
  STAGE_ENV,
  ALLOWED_REGIONS,
  ENDPOINTS
}
