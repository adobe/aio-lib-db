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
