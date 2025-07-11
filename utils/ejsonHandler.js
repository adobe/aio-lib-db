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
const { BSONValue, EJSON } = require("bson")

/**
 * Transform any of the object's properties that are BSONValues representing primitives back into their js types
 * Does a recursive deep mapping
 *
 * @param {Object} obj
 * @returns {BSONValue|Object|*}
 */
function transformBsonPrimitives(obj) {
  // A long-standing bug in js makes typeof null = 'object', so filter that out first
  if (obj === null) {
    return obj
  }
  else if (obj instanceof BSONValue) {
    if (obj.valueOf !== undefined && typeof obj.valueOf() !== 'object') {
      return obj.valueOf()
    }
    return obj
  }
  else if (Array.isArray(obj)) {
    return obj.map((val) => {
      return transformBsonPrimitives(val)
    })
  }
  else if (typeof obj === 'object') {
    const mapped = {}
    Object.keys(obj).forEach((key) => {
      mapped[key] = transformBsonPrimitives(obj[key])
    })
    return mapped
  }
  else {
    return obj
  }
}

/**
 * Parse a response into BSON with {relaxed: false} except for primitives
 *
 * @param {Object} res The body from an Axios response
 * @returns {Object}
 */
function cleanParse(res) {
  return transformBsonPrimitives(EJSON.parse(JSON.stringify(res), { relaxed: false }))
}

module.exports = {
  cleanParse
}
