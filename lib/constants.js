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

const RUNTIME_HEADER = 'x-runtime-namespace'
const REQUEST_ID_HEADER = 'x-request-id'
const IMS_AUTHORIZATION_HEADER = 'Authorization'
const IMS_AUTHORIZATION_HEADER_PREFIX = 'Bearer '
const CLI_CONTEXT_NAME = 'cli'

const CURSOR_INIT_ERR_MESSAGE = 'Cursor has already been initialized, cannot modify request.'

const PROD_ENV = 'prod'
const STAGE_ENV = 'stage'

const ALLOWED_REGIONS = {
  // First region in an environment's array is the default
  [PROD_ENV]: ['amer', 'emea', 'apac'],
  [STAGE_ENV]: ['amer', 'amer2']
}

// For stage we use the public endpoints for interacting with Production I/O runtime as connecting
// cross envs is not allowed in MCT.
const STAGE_ENDPOINT = 'https://storage-database-<region>.stg.app-builder.adp.adobe.io'
const PROD_ENDPOINT_RUNTIME = 'https://storage-database-<region>.app-builder.int.adp.adobe.io'
const PROD_ENDPOINT_EXTERNAL = 'https://storage-database-<region>.app-builder.adp.adobe.io'

module.exports = {
  RUNTIME_HEADER,
  REQUEST_ID_HEADER,
  IMS_AUTHORIZATION_HEADER,
  IMS_AUTHORIZATION_HEADER_PREFIX,
  CLI_CONTEXT_NAME,
  CURSOR_INIT_ERR_MESSAGE,
  PROD_ENV,
  STAGE_ENV,
  ALLOWED_REGIONS,
  STAGE_ENDPOINT,
  PROD_ENDPOINT_RUNTIME,
  PROD_ENDPOINT_EXTERNAL
}
