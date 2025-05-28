const { Long } = require("bson")
const { apiPost } = require("../utils/apiRequest")
const { Readable, Transform } = require("node:stream")

class Cursor extends Readable {
  /** @type Abdb */
  #abdb
  /** @type string */
  #getMoreUrl
  /** @type Object[] */
  #buffer
  /** @type boolean */
  #closed
  /** @type boolean */
  #readInProgress

  // Read-only public properties
  /** @type {(Long|number)} */
  #id
  /** @type string */
  #collectionName
  /** @type Object */
  #operation
  /** @type Object */
  #options

  /**
   * @param {Abdb} abdb
   * @param {Object} operationDefinition
   * @param {string} operationDefinition.type Either FIND or AGGREGATE
   * @param {string} collection
   * @param {Long|number} cursorId
   * @param {Object[]=} firstBatch
   * @param {Object=} options
   */
  constructor(abdb, operationDefinition, collection, cursorId, firstBatch = [], options = {}) {
    super({ objectMode: true, highWaterMark: 1 })
    this.#abdb = abdb
    this.#collectionName = collection
    this.#getMoreUrl = `collection/${collection}/getMore`
    this.#options = options
    this.#buffer = firstBatch
    this.#id = cursorId
    this.#closed = Long.ZERO.eq(this.#id)
    this.#operation = operationDefinition
    this.#readInProgress = false
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
    const data = await apiPost(this.#abdb, this.#getMoreUrl, { cursorId: this.#id }, this.#options)
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

  async* [Symbol.asyncIterator]() {
    while (await this.hasNext()) {
      yield await this.next()
    }
  }

  /**
   * Get a readable stream version of the cursor with a transform if desired
   *
   * @param {{(doc: Object): Object}=} transform A function that takes a document and applies some transformation
   * @returns {Stream.Readable}
   */
  stream(transform = undefined) {
    // Cursor is already a readable stream, so return itself unless a transform method is provided
    const readable = this
    if (transform) {
      const transformedStream = readable.pipe(
        new Transform({
          objectMode: true,
          highWaterMark: 1,
          transform(chunk, _, callback) {
            try {
              const transformed = transform(chunk)
              callback(undefined, transformed)
            }
            catch (err) {
              callback(err)
            }
          }
        })
      )
      readable.on('error', err => transformedStream.emit('error', err))
      return transformedStream
    }

    return readable
  }

  async _read(size) {
    if (!this.#readInProgress) {
      this.#readInProgress = true
      try {
        if (!(await this.hasNext())) {
          this.push(null)
          return
        }
        this.push(await this.next())
        this.#readInProgress = false
      }
      catch (err) {
        this.destroy(err)
      }
    }
  }
}

module.exports = Cursor
