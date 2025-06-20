class DbError extends Error {
  constructor(message, requestId = null, options = {}) {
    super(message, options)
    this.name = 'DbError'
    this.requestId = requestId
  }
}

module.exports = DbError
