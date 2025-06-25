const { apiPost } = require("../utils/apiRequest")
const AbstractDbCursor = require("./AbstractDbCursor")

class FindCursor extends AbstractDbCursor {
  #filter

  constructor(db, collectionName, filter, options) {
    super(db, collectionName, options)
    this.#filter = filter
  }

  /**
   * Get the first batch of results from the database
   *
   * @returns {Promise<Object>}
   * @throws {DbError}
   * @protected
   * @internal
   */
  async _firstRequest() {
    return await apiPost(this._db, `collection/${this._collection}/find`, { filter: this.#filter }, this._options)
  }

  /**
   * Set the query filter
   *
   * @param {Object} filter
   * @returns {this|Readable}
   */
  filter(filter) {
    this._throwIfInitialized()
    this.#filter = filter
    return this
  }

  /**
   * Set the sort order for the query
   *
   * @param {(string|string[]|Object|number)} sort
   * @param {(string|Object|number)=} direction
   * @returns {this}
   */
  sort(sort, direction = undefined) {
    this._throwIfInitialized()
    // Defer formatting to the service to avoid depending on the mongodb library here
    this._options.sort = { sort: sort, direction: direction }
    return this
  }

  /**
   * Set the projection for the query
   *
   * @param {Object} projection
   * @returns {this}
   */
  project(projection) {
    // The actual option is 'projection', but project() is the name of the method that sets it
    // on MongoDb's FindCursor class
    this._throwIfInitialized()
    this._options.projection = projection
    return this
  }

  /**
   * Set the limit for the query
   *
   * @param {number} limit
   * @returns {this}
   */
  limit(limit) {
    this._throwIfInitialized()
    this._options.limit = limit
    return this
  }

  /**
   * Set the number of documents to skip before returning results
   *
   * @param {number} skip
   * @returns {this}
   */
  skip(skip) {
    this._throwIfInitialized()
    this._options.skip = skip
    return this
  }
}

module.exports = FindCursor
