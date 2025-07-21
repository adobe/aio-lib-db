/*
Copyright 2025 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/
const { Long } = require("bson")
const { apiPost } = require("../utils/apiRequest")
const { Readable, Transform } = require("node:stream")
const DbError = require("./DbError")
const { CURSOR_INIT_ERR_MESSAGE } = require("./constants")

/**
 * Abstract base class for database cursors.
 * @abstract
 */
class AbstractDbCursor extends Readable {
  /** @type string */
  #getMoreUrl
  /** @type boolean */
  #readInProgress
  /** @type function */
  #transform

  // Protected properties
  /** @type DbBase */
  _db
  /** @type string */
  _collection
  /** @type Object */
  _options
  /** @type Object[] */
  _buffer
  /** @type boolean */
  _closed
  /** @type {(Long|number)} */
  _id
  /** @type boolean */
  _initialized

  /**
   * @param {DbBase} db
   * @param {string} collection
   * @param {Object} options
   */
  constructor(db, collection, options) {
    super({ objectMode: true, highWaterMark: 1 })
    this._initialized = false
    this._db = db
    this._collection = collection
    this.#getMoreUrl = `collection/${collection}/getMore`
    this._options = options
    this.#readInProgress = false
    this.#transform = null
  }

  /**
   * Checks if there are more results that have not been exhausted yet
   *
   * @returns {Promise<boolean>}
   * @throws {DbError}
   */
  async hasNext() {
    if (!this._initialized) {
      await this.#initialize()
    }
    else if (this._buffer.length === 0 && !this._closed) {
      await this.#getMore()
    }
    return this._buffer.length > 0
  }

  /**
   * Gets and exhausts the next result, or returns null if no results are remaining
   *
   * @returns {Promise<Object|null>}
   * @throws {DbError}
   */
  async next() {
    let res = await this.hasNext() ? this._buffer.shift() : null
    if (this.#transform) {
      res = await this.#transform(res)
    }
    return res
  }

  /**
   * Gets the rest of the results in a single array and exhausts the cursor
   *
   * @returns {Promise<Object[]>}
   * @throws {DbError}
   */
  async toArray() {
    let results = []
    while (await this.hasNext()) {
      results = results.concat(this._buffer)
      this._buffer = []
    }
    if (this.#transform) {
      results = await Promise.all(results.map(doc => this.#transform(doc)))
    }
    return results
  }

  async #getMore() {
    // getMore does not accept all options that the initial request does
    const getMoreOptions = {}
    if (this._options.batchSize) {
      getMoreOptions.batchSize = this._options.batchSize
    }
    if (this._options.comment) {
      getMoreOptions.comment = this._options.comment
    }
    const data = await apiPost(this._db, this.#getMoreUrl, { cursorId: this._id }, getMoreOptions, true)
    this._buffer = data.cursor['nextBatch']
    this._closed = Long.ZERO.eq(data.cursor['id'])
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
    return this._id
  }

  /**
   * The cursor is closed and all remaining locally buffered documents have been iterated.
   *
   * @returns {boolean}
   */
  get closed() {
    return this._initialized && this._closed && this._buffer?.length === 0
  }

  /**
   * Set the batch size for the cursor.
   *
   * @param {number} batchSize
   * @returns {this}
   */
  batchSize(batchSize) {
    this._throwIfInitialized()
    this._options.batchSize = batchSize
    return this
  }

  /**
   * Set a transformation function to apply to each document in the cursor.
   *
   * @param {function} fun
   * @returns {this}
   */
  map(fun) {
    this._throwIfInitialized()
    if (this.#transform) {
      const oldTransform = this.#transform
      this.#transform = async (doc) => {
        return fun(await oldTransform(doc))
      }
    }
    else {
      this.#transform = fun
    }
    return this
  }

  /**
   * Throw an error if iteration has already started.
   *
   * @throws {DbError}
   * @protected
   * @internal
   */
  _throwIfInitialized() {
    if (this._initialized) {
      throw new DbError(CURSOR_INIT_ERR_MESSAGE)
    }
  }

  /**
   * Initialize the cursor by making the first request to the API.
   * This is called automatically when the first call to hasNext() is made.
   * After initialization, no further modifications to the request can be made.
   *
   * @returns {Promise<void>}
   */
  async #initialize() {
    const firstBatch = await this._firstRequest()
    this._id = firstBatch.cursor.id
    this._closed = Long.ZERO.eq(this._id)
    this._buffer = firstBatch.cursor['firstBatch']
    this._initialized = true
  }

  /**
   * Method to be implemented by subclasses to make the first API request.
   * Should be a single call to apiRequest.apiPost()
   *
   * @returns {Promise<Object>}
   * @protected
   * @internal
   * @abstract
   */
  _firstRequest() {
    throw new SyntaxError('The _firstRequest() method must be implemented by the subclass.')
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
    let readable = Readable.from(this)
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
      readable = transformedStream
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

module.exports = AbstractDbCursor
