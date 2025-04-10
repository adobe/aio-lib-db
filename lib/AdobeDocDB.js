class AdobeDocDB {
  constructor (credentials) {
    this.tenantId = credentials.tenantId
    console.log('AdobeDocDB instance initialized successfully.')
  }

  /**
   * Instantiates and returns a new AdobeDocDB object
   *
   * @static
   * @param {object} credentials initialization parameters
   * @param {string} credentials.tenantId tenant ID (required)
   * @returns {Promise<AdobeDocDB>} a new AdobeDocDB instance
   * @memberof AdobeDocDB
   */
  static async init (credentials = {}) {
    return new AdobeDocDB(credentials)
  }
}

module.exports = AdobeDocDB