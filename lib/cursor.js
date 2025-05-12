const AbdbError = require('./abdbError')
const { Long, EJSON } = require("bson")
const { ENDPOINT_URL } = require("./constants")

class Cursor {
  #axiosClient
  #tenantHeader
  #getMoreUrl
  #buffer
  #closed

  // Read-only public properties
  #id
  #collectionName
  #tenantId
  #operation
  #options

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

  async hasNext() {
    if (this.#buffer.length === 0 && !this.#closed) {
      await this.#getMore()
    }
    return this.#buffer.length > 0
  }

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

  get id() {
    return this.#id
  }

  get tenantId() {
    return this.#tenantId
  }

  get collectionName() {
    return this.#collectionName
  }

  get operation() {
    return this.#operation
  }

  get options() {
    return this.#options
  }
}

module.exports = Cursor
