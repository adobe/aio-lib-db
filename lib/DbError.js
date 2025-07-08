class DbError extends Error {
  constructor(message, requestId = null, httpStatusCode = undefined, options = {}) {
    super(message, options)
    this.name = 'DbError'
    this.requestId = requestId
    this.httpStatusCode = httpStatusCode
  }
}

module.exports = DbError
