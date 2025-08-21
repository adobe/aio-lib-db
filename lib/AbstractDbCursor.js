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
const { Readable, Transform } = require("node:stream")
const DbError = require("./DbError")
const { CURSOR_INIT_ERR_MESSAGE } = require("./constants")
const { getAxiosClient } = require("../utils/axiosUtils")
const { getMoreApi } = require("./api/collection")
const { closeApi } = require("./api/client")

/**
 * Abstract base class for database cursors.
 * @abstract
 */
class AbstractDbCursor extends Readable {
  /** @type boolean */
  #readInProgress
  /** @type function */
  #transform
  /** @type boolean */
  #hasEmittedClose

  // Protected properties
  /** @type DbBase */
  _db
  /** @type DbClient */
  _dbClient
  /** @type string */
  _collection
  /** @type Object */
  _options
  /** @type Object[] */
  _buffer
  /** @type boolean */
  _sessionClosed
  /** @type {(Long|number)} */
  _id
  /** @type boolean */
  _initialized
  /** @type AxiosInstance */
  _axiosClient

  /**
   * @param {DbBase} db
   * @param {DbClient} dbClient
   * @param {string} collection
   * @param {Object} options
   */
  constructor(db, dbClient, collection, options) {
    super({ objectMode: true, highWaterMark: 1 })
    this._initialized = false
    this._db = db
    this._dbClient = dbClient
    this._collection = collection
    this._options = options
    this.#readInProgress = false
    this.#transform = null
    this._sessionClosed = false
    this.#hasEmittedClose = false
    this._axiosClient = getAxiosClient(true)
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
    else if (this._buffer.length === 0 && !this.#isDead) {
      try {
        await this._getMore()
      }
      catch (err) {
        try {
          await this.close()
        }
        catch (swallow) {
          // Throw the original error, not any that happen while killing the cursor in response
        }
        throw err
      }
    }

    // Automatically close the session if the end of the results has been reached
    if (Long.ZERO.eq(this._id)) {
      await this.close()
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
    if (res !== null && this.#transform) {
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

  async _getMore() {
    // getMore does not accept all options that the initial request does
    const getMoreOptions = {}
    if (this._options.batchSize) {
      getMoreOptions.batchSize = this._options.batchSize
    }
    if (this._options.comment) {
      getMoreOptions.comment = this._options.comment
    }
    const data = await getMoreApi(this._db, this._axiosClient, this._collection, this._id, getMoreOptions)
    this._buffer = data.cursor['nextBatch']
    if (Long.ZERO.eq(data.cursor['id'])) {
      this._id = Long.ZERO
    }
  }

  /**
   * Closes the API session. If the cursor was not dead, also clear the buffer to release resources.
   */
  async close() {
    if (!this._sessionClosed) {
      this._sessionClosed = true
      this._dbClient.unregisterCursor(this)
      // If the session has been closed before the end of results was reached either through an error or explicit close,
      // stop iteration and clear the buffer
      if (this._initialized && this._id && Long.ZERO.ne(this._id)) {
        this._id = Long.ZERO
        this._buffer = []
      }
      try {
        await closeApi(this._db, this._axiosClient)
      }
      finally {
        // Note: the 'close' event signifies that the cursor session is no longer active, regardless of any remaining
        // documents in the buffer. This is in contrast to 'cursor.closed', which waits for the buffer to be consumed.
        // This matches the behavior of the MongoDB Node.js driver.
        if (!this.#hasEmittedClose) {
          this.emit('close')
        }
      }
    }
  }

  emit(event, ...args) {
    try {
      super.emit(event, ...args)
    }
    finally {
      if (event?.toLowerCase() === 'close') {
        this.#hasEmittedClose = true
      }
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
    return this._id
  }

  /**
   * A cursor is closed if all buffered documents have been consumed and no more will be retrieved.
   *
   * @returns {boolean}
   */
  get closed() {
    return this._initialized && this.#isDead && this._buffer?.length === 0
  }

  /**
   * Checks if the cursor will fetch more results from the API
   *
   * @return {boolean}
   */
  get #isDead() {
    return Long.ZERO.eq(this._id) || this._sessionClosed
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
    // Register the cursor as active with the DbClient then make the first request
    this._dbClient.registerCursor(this)
    const firstBatch = await this._firstRequest()
    this._id = firstBatch.cursor.id
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
