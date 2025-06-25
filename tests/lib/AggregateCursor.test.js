const { getDb } = require("../testingUtils")
const { default: axios } = require('axios')
const { CURSOR_INIT_ERR_MESSAGE } = require("../../lib/constants")

const axiosClient = axios.create()

describe('AggregateCursor tests', () => {
  let collection

  beforeEach(async () => {
    const client = await getDb().connect()
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

    expect(axiosClient).toHaveCalledServicePost(
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
})
