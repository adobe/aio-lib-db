class AbdbError extends Error {
  constructor(message, requestId = null, options = {}) {
    super(message, options)
    this.name = 'AbdbError'
    this.requestId = requestId
  }
}

module.exports = AbdbError
