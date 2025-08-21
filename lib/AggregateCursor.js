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
const AbstractDbCursor = require("./AbstractDbCursor")
const { aggregateApi } = require("./api/collection")

class AggregateCursor extends AbstractDbCursor {
  #pipeline

  /**
   * @param {DbBase} db
   * @param {DbClient} client
   * @param {string} collectionName
   * @param {Object[]} pipeline
   * @param {Object} options
   */
  constructor(db, client, collectionName, pipeline, options) {
    super(db, client, collectionName, options)
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
    return await aggregateApi(this._db, this._axiosClient, this._collection, this.#pipeline, this._options)
  }

  /**
   * Explains the query
   *
   * @returns {Object}
   */
  async explain() {
    this._throwIfInitialized()
    this._options.explain = true
    // Explain results don't get iterated on, so we don't need the buffer or session
    const explainResults = await aggregateApi(
      this._db,
      this._db.axiosClient,
      this._collection,
      this.#pipeline,
      this._options
    )
    this._id = 0
    this._sessionClosed = true
    this._buffer = []
    this._initialized = true
    return explainResults
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
