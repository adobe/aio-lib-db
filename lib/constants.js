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

// Set ADPSD_SERVICE_URL='http://localhost:5000' in .env for local testing
const ENDPOINT_URL = process.env.ADPSD_SERVICE_URL || 'https://core-commerce-saas-ab-dbproxy-service-deploy-ethos-d8c690.stage.cloud.adobe.io'

const RUNTIME_HEADER = 'x-runtime-namespace'
const REQUEST_ID_HEADER = 'x-request-id'

const CURSOR_INIT_ERR_MESSAGE = 'Cursor has already been initialized, cannot modify request.'

module.exports = {
  ENDPOINT_URL,
  RUNTIME_HEADER,
  REQUEST_ID_HEADER,
  CURSOR_INIT_ERR_MESSAGE
}
