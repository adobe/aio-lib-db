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
const { dbStatsApi, closeApi, listCollectionsApi, createCollectionApi } = require('./api/client')
const DbCollection = require('./DbCollection')

class DbClient {
  /**
   * @param {DbBase} db
   * @hideconstructor
   */
  constructor(db) {
    this.db = db
  }

  /**
   * Instantiates and returns a new DbClient object scoped to the configured namespace
   *
   * @static
   * @constructs
   * @param {DbBase} db
   * @returns {Promise<DbClient>}
   */
  static async init(db) {
    return new DbClient(db)
  }

  /**
   * Get the statistics for the scoped database
   *
   * @returns {Promise<Object>}
   * @throws {DbError}
   */
  async dbStats() {
    return dbStatsApi(this.db)
  }

  /**
   * List the collections in the scoped database according to the filter if provided
   *
   * @param {Object=} filter
   * @param {Object=} options
   * @returns {Promise<Object[]>}
   * @throws {DbError}
   */
  async listCollections(filter = {}, options = {}) {
    return listCollectionsApi(this.db, filter, options)
  }

  /**
   * Close the DB session
   *
   * @returns {Promise<void>}
   * @throws {DbError}
   */
  async close() {
    await closeApi(this.db)
    this.db.connected = false
  }

  /**
   * Gets the collection with the given name from the scoped database
   *
   * @param {string} name
   * @returns {DbCollection}
   */
  collection(name) {
    return DbCollection.init(name, this.db)
  }

  /**
   * Creates a new collection in the scoped database
   *
   * @param {string} name
   * @param {Object=} options
   * @returns {Promise<DbCollection>}
   * @throws {DbError}
   */
  async createCollection(name, options = {}) {
    await createCollectionApi(this.db, name, options)
    return DbCollection.init(name, this.db)
  }
}

module.exports = DbClient
