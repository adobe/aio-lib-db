const AbdbError = require('./abdbError')
const { Long, EJSON } = require("bson")
const { ENDPOINT_URL } = require("./constants")

class Cursor {
  /** @type AxiosStatic */
  #axiosClient
  /** @type Object
   * @mixes AxiosRequestConfig */
  #tenantHeader
  /** @type string */
  #getMoreUrl
  /** @type Object[] */
  #buffer
  /** @type boolean */
  #closed

  // Read-only public properties
  /** @type {(Long|number)} */
  #id
  /** @type string */
  #collectionName
  /** @type string */
  #tenantId
  /** @type Object */
  #operation
  /** @type Object */
  #options

  /**
   * @param {AxiosStatic} axiosClient
   * @param {Object} operationDefinition
   * @param {string} operationDefinition.type Either FIND or AGGREGATE
   * @param {string} tenantId
   * @param {string} collection
   * @param {Long|number} cursorId
   * @param {Object[]=} firstBatch
   * @param {Object=} options
   */
  constructor(axiosClient, operationDefinition, tenantId, collection, cursorId, firstBatch = [], options = {}) {
    this.#axiosClient = axiosClient
    this.#tenantId = tenantId
    this.#tenantHeader = {
      headers: {
        'x-abdb-tenant-id': tenantId
      }
    }
    this.#collectionName = collection
    this.#getMoreUrl = `${ENDPOINT_URL}/v1/collection/${collection}/getMore`
    this.#options = options
    this.#buffer = firstBatch
    this.#id = cursorId
    this.#closed = Long.ZERO.eq(this.#id)
    this.#operation = operationDefinition
  }

  /**
   * Checks if there are more results that have not been exhausted yet
   *
   * @returns {Promise<boolean>}
   * @throws {AbdbError}
   */
  async hasNext() {
    if (this.#buffer.length === 0 && !this.#closed) {
      await this.#getMore()
    }
    return this.#buffer.length > 0
  }

  /**
   * Gets and exhausts the next result, or returns undefined if no results are remaining
   *
   * @returns {Promise<Object|undefined>}
   * @throws {AbdbError}
   */
  async next() {
    return await this.hasNext() ? this.#buffer.shift() : undefined
  }

  async #getMore() {
    try {
      const res = await this.#axiosClient.post(
        this.#getMoreUrl,
        EJSON.stringify({ cursorId: this.#id, options: this.#options }, { relaxed: false }),
        this.#tenantHeader
      )
      if (!res.data.success) {
        throw new AbdbError(`getMore failed: ${res.data.message}`)
      }
      const data = res.data.data
      this.#buffer = data.cursor['nextBatch']
      this.#closed = Long.ZERO.eq(data.cursor['id'])
    }
    catch (err) {
      if (err.response?.data) {
        throw new AbdbError(`getMore failed: ${err.response.data.message}`, { cause: err })
      }
      throw err
    }
  }

  /**
   * The cursor ID
   * Will be 0 if the results fit in one batch.
   *
   * @const
   * @readonly
   * @returns {Long|number}
   */
  get id() {
    return this.#id
  }

  /**
   * The id of the tenant for the cursor
   *
   * @const
   * @readonly
   * @returns {string}
   */
  get tenantId() {
    return this.#tenantId
  }

  /**
   * The name of the collection the cursor is attached to
   *
   * @const
   * @readonly
   * @returns {string}
   */
  get collectionName() {
    return this.#collectionName
  }

  /**
   * The definition of the operation that opened the cursor
   * The result will contain type: "<FIND|AGGREGATE>" and the appropriate fields from that type (filter, pipeline)
   *
   * @constant
   * @readonly
   * @returns {Object}
   */
  get operation() {
    return this.#operation
  }

  /**
   * The options used on the operation that opened the cursor
   *
   * @constant
   * @readonly
   * @returns {Object}
   */
  get options() {
    return this.#options
  }
}

module.exports = Cursor
