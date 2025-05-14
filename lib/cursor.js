const { Long } = require("bson")
const { apiPost } = require("../utils/apiRequest")

class Cursor {
  /** @type AxiosStatic */
  #axiosClient
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
    this.#collectionName = collection
    this.#getMoreUrl = `collection/${collection}/getMore`
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

  /**
   * Gets the rest of the results in a single array and exhausts the cursor
   *
   * @returns {Promise<Object[]>}
   * @throws {AbdbError}
   */
  async toArray() {
    let results = []
    while (await this.hasNext()) {
      results = results.concat(this.#buffer)
      this.#buffer = []
    }
    return results
  }

  async #getMore() {
    const data = await apiPost(
      this.#axiosClient,
      this.#getMoreUrl,
      this.#tenantId,
      { cursorId: this.#id },
      this.#options
    )
    this.#buffer = data.cursor['nextBatch']
    this.#closed = Long.ZERO.eq(data.cursor['id'])
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
