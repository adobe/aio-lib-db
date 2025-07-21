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
const { getDb } = require("../testingUtils")
const { CURSOR_INIT_ERR_MESSAGE } = require("../../lib/constants")

describe('AggregateCursor tests', () => {
  let collection
  let sessClient
  let nonSessClient

  beforeEach(async () => {
    const db = getDb()
    sessClient = db.axiosClientWithSession
    nonSessClient = db.axiosClientWithoutSession
    const client = await db.connect()
    collection = client.collection('testCollection')
    jest.clearAllMocks()
  })

  test('request body is properly generated from chained methods', async () => {
    const cursor = collection.aggregate()
      .match({ $expr: { $not: { $eq: ['$director', '$$excludedDirector'] } } })
      .lookup({
        from: 'awards_by_movie',
        localField: 'title',
        foreignField: 'title',
        as: 'awards'
      })
      .project({ 'director': 1, 'stars': 1, 'awards': { '$size': '$awards' } })
      .redact({ $cond: { if: { $gte: ['$awards', 1] }, then: '$$DESCEND', else: '$$PRUNE' } })
      .group({ '_id': '$director', 'winning_movie_count': { '$count': {} }, 'award_count': { '$sum': '$awards' } })
      .addStage({ $project: { 'director': 1, 'award_count': 1 } })
      .skip(1)
      .unwind('$director')
      .geoNear({ distanceField: 'loc', near: { type: 'Point', coordinates: [-73.856, 40.848] }, maxDistance: 1000 })
      .limit(10)
      .sort({ 'award_count': -1 })
      .out('directors_aggregate')
      .batchSize(5)

    // Initialize the cursor to trigger the request
    await cursor.hasNext()

    expect(sessClient).toHaveCalledServicePost(
      'v1/collection/testCollection/aggregate',
      {
        pipeline: [
          { $match: { $expr: { $not: { $eq: ['$director', '$$excludedDirector'] } } } },
          {
            $lookup: {
              from: 'awards_by_movie',
              localField: 'title',
              foreignField: 'title',
              as: 'awards'
            }
          },
          { $project: { director: 1, stars: 1, awards: { $size: '$awards' } } },
          { $redact: { $cond: { if: { $gte: ['$awards', 1] }, then: '$$DESCEND', else: '$$PRUNE' } } },
          { $group: { _id: '$director', winning_movie_count: { $count: {} }, award_count: { $sum: '$awards' } } },
          { $project: { director: 1, award_count: 1 } },
          { $skip: 1 },
          { $unwind: '$director' },
          {
            $geoNear: {
              distanceField: 'loc',
              near: { type: 'Point', coordinates: [-73.856, 40.848] },
              maxDistance: 1000
            }
          },
          { $limit: 10 },
          { $sort: { award_count: -1 } },
          { $out: 'directors_aggregate' }
        ],
        options: { batchSize: 5 }
      }
    )
    expect(nonSessClient).not.toHaveCalledServicePost('v1/collection/testCollection/aggregate')
  })

  test('chained functions cannot change cursor after it has been initialized', async () => {
    const cursor = collection.aggregate()
    await cursor.hasNext()

    expect(() => cursor.match({ $expr: { $eq: ['$director', 'Spielberg'] } })).toThrow(CURSOR_INIT_ERR_MESSAGE)
    expect(() => cursor.lookup({ from: 'awards', localField: 'title', foreignField: 'title', as: 'awards' }))
      .toThrow(CURSOR_INIT_ERR_MESSAGE)
    expect(() => cursor.project({ director: 1, stars: 1 })).toThrow(CURSOR_INIT_ERR_MESSAGE)
    expect(() => cursor.redact({ $cond: { if: { $gte: ['$awards', 1] }, then: '$$DESCEND', else: '$$PRUNE' } }))
      .toThrow(CURSOR_INIT_ERR_MESSAGE)
    expect(() => cursor.group({ _id: '$director', award_count: { $sum: '$awards' } })).toThrow(CURSOR_INIT_ERR_MESSAGE)
    expect(() => cursor.addStage({ $project: { director: 1, award_count: 1 } })).toThrow(CURSOR_INIT_ERR_MESSAGE)
    expect(() => cursor.skip(1)).toThrow(CURSOR_INIT_ERR_MESSAGE)
    expect(() => cursor.unwind('$director')).toThrow(CURSOR_INIT_ERR_MESSAGE)
    expect(() => cursor.geoNear({ distanceField: 'loc', near: { type: 'Point', coordinates: [-73.856, 40.848] } }))
      .toThrow(CURSOR_INIT_ERR_MESSAGE)
    expect(() => cursor.limit(10)).toThrow(CURSOR_INIT_ERR_MESSAGE)
    expect(() => cursor.sort({ award_count: -1 })).toThrow(CURSOR_INIT_ERR_MESSAGE)
    expect(() => cursor.out('directors_aggregate')).toThrow(CURSOR_INIT_ERR_MESSAGE)
  })

  test('cursor.explain() immediately calls the api and closes the cursor', async () => {
    const cursor = collection.aggregate()
    await cursor.explain()
    expect(sessClient).toHaveCalledServicePost(
      'v1/collection/testCollection/aggregate',
      { pipeline: [], options: { explain: true } }
    )
    expect(nonSessClient).not.toHaveCalledServicePost('v1/collection/testCollection/aggregate')
    // After calling explain, the cursor should be closed and not usable
    expect(cursor.closed).toBe(true)
    expect(await cursor.hasNext()).toBe(false)
    expect(sessClient).not.toHaveCalledServicePost('v1/collection/testCollection/getMore')
    expect(nonSessClient).not.toHaveCalledServicePost('v1/collection/testCollection/getMore')
  })

  test('cursor.explain(), cursor.batchSize(), and cursor.map() cannot be called after initialization', async () => {
    const cursor = collection.aggregate()
    await cursor.hasNext() // Initialize the cursor

    await expect(cursor.explain()).rejects.toThrow(CURSOR_INIT_ERR_MESSAGE)
    expect(() => cursor.batchSize(10)).toThrow(CURSOR_INIT_ERR_MESSAGE)
    expect(() => cursor.map(doc => doc)).toThrow(CURSOR_INIT_ERR_MESSAGE)
  })
})
