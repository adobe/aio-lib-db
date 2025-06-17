module.exports = {
  setupFiles: ['<rootDir>/jest.setup.js'],
  clearMocks: true,
  collectCoverage: true,
  coverageDirectory: 'coverage',
  coverageProvider: 'v8',
  testTimeout: 60000
}
