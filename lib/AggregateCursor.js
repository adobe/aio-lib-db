const { apiPost } = require("../utils/apiRequest")
const AbstractDbCursor = require("./AbstractDbCursor")

class AggregateCursor extends AbstractDbCursor {
  #pipeline

  /**
   * @param {DbBase} db
   * @param {string} collectionName
   * @param {Object[]} pipeline
   * @param {Object} options
   */
  constructor(db, collectionName, pipeline, options) {
    super(db, collectionName, options)
    this.#pipeline = pipeline
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
    return await apiPost(
      this._db,
      `collection/${this._collection}/aggregate`,
      { pipeline: this.#pipeline },
      this._options,
      true
    )
  }

  /**
   * Add a stage to the aggregation pipeline.
   *
   * @param {Object} stage
   * @returns {this}
   */
  addStage(stage) {
    this._throwIfInitialized()
    this.#pipeline.push(stage)
    return this
  }

  /**
   * Add a $group stage to the aggregation pipeline.
   *
   * @param {Object} groupSpec
   * @returns {this}
   */
  group(groupSpec) {
    return this.addStage({ $group: groupSpec })
  }

  /**
   * Add a $limit stage to the aggregation pipeline.
   * @param {number} limit
   * @returns {this}
   */
  limit(limit) {
    return this.addStage({ $limit: limit })
  }

  /**
   * Add a $match stage to the aggregation pipeline.
   *
   * @param {Object} matchSpec
   * @returns {this}
   */
  match(matchSpec) {
    return this.addStage({ $match: matchSpec })
  }

  /**
   * Add an $out stage to the aggregation pipeline.
   *
   * @param {(Object|string)} outSpec
   * @returns {this}
   */
  out(outSpec) {
    return this.addStage({ $out: outSpec })
  }

  /**
   * Add a $project stage to the aggregation pipeline.
   *
   * @param {Object} projectSpec
   * @returns {this}
   */
  project(projectSpec) {
    return this.addStage({ $project: projectSpec })
  }

  /**
   * Add a $lookup stage to the aggregation pipeline
   *
   * @param {Object}lookupSpec
   * @returns {this}
   */
  lookup(lookupSpec) {
    return this.addStage({ $lookup: lookupSpec })
  }

  /**
   * Add a $redact stage to the aggregation pipeline
   *
   * @param {Object} redactSpec
   * @returns {this}
   */
  redact(redactSpec) {
    return this.addStage({ $redact: redactSpec })
  }

  /**
   * Add a $skip stage to the aggregation pipeline.
   *
   * @param {number} skip
   * @returns {this}
   */
  skip(skip) {
    return this.addStage({ $skip: skip })
  }

  /**
   * Add a $sort stage to the aggregation pipeline
   *
   * @param {(Object|string|number)} sortSpec
   * @returns {this}
   */
  sort(sortSpec) {
    return this.addStage({ $sort: sortSpec })
  }

  /**
   * Add a $count stage to the aggregation pipeline
   *
   * @param {(Object|string)} unwindSpec
   * @returns {this}
   */
  unwind(unwindSpec) {
    return this.addStage({ $unwind: unwindSpec })
  }

  /**
   * Add a $geoNear stage to the aggregation pipeline
   *
   * @param {Object} geoNearSpec
   * @returns {this}
   */
  geoNear(geoNearSpec) {
    return this.addStage({ $geoNear: geoNearSpec })
  }
}

module.exports = AggregateCursor
