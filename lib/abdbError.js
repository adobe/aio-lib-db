class AbdbError extends Error {
  constructor(message, options) {
    super(message, options)
    this.name = 'AbdbError'
  }
}

module.exports = AbdbError
