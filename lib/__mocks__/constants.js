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

const constants = jest.requireActual('../constants')

// Set the endpoints to known test URLs
module.exports = {
  ...constants,
  ENDPOINTS: {
    [constants.EXECUTION_CONTEXT.RUNTIME]: {
      [constants.PROD_ENV]: 'https://db.<region>.int.adobe.test',
      [constants.STAGE_ENV]: 'https://db-stage.<region>.int.adobe.test'
    },
    [constants.EXECUTION_CONTEXT.EXTERNAL]: {
      [constants.PROD_ENV]: 'https://db.<region>.adobe.test',
      [constants.STAGE_ENV]: 'https://db-stage.<region>.adobe.test'
    }
  }
}
