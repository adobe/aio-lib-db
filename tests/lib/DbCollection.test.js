const { getDb } = require("../testingUtils")
const { default: axios } = require('axios')

const axiosClient = axios.create()

describe('DbCollection tests', () => {
  let collection

  beforeEach(async () => {
    const client = await getDb().connect()
    collection = client.collection('testCollection')
    jest.clearAllMocks()
  })

  test('insertOne calls the appropriate endpoint', async () => {
    const doc = { name: 'Item1', price: 100 }
    await collection.insertOne(doc)
    expect(axiosClient).toHaveCalledServicePost('v1/collection/testCollection/insertOne', { document: doc })
  })

  test('insertMany calls the appropriate endpoint', async () => {
    const docs = [{ name: 'Item1', price: 100 }, { name: 'Item2', price: 200 }]
    await collection.insertMany(docs)
    expect(axiosClient).toHaveCalledServicePost('v1/collection/testCollection/insertMany', { documents: docs })
  })

  test('findOne calls the appropriate endpoint', async () => {
    const filter = { name: 'Item1' }
    await collection.findOne(filter)
    expect(axiosClient).toHaveCalledServicePost('v1/collection/testCollection/findOne', { filter: filter })
  })

  test('replaceOne calls the appropriate endpoint', async () => {
    const filter = { name: 'Item1' }
    const replacement = { name: 'NewItem', price: 150 }
    await collection.replaceOne(filter, replacement)
    expect(axiosClient).toHaveCalledServicePost(
      'v1/collection/testCollection/replaceOne',
      { filter: filter, replacement: replacement }
    )
  })

  test('updateOne calls the appropriate endpoint', async () => {
    const filter = { name: 'Item1' }
    const update = { $set: { price: 150 } }
    await collection.updateOne(filter, update)
    expect(axiosClient).toHaveCalledServicePost(
      'v1/collection/testCollection/updateOne',
      { filter: filter, update: update }
    )
  })

  test('updateMany calls the appropriate endpoint', async () => {
    const filter = { category: 'electronics' }
    const update = { $set: { stock: 50 } }
    await collection.updateMany(filter, update)
    expect(axiosClient).toHaveCalledServicePost(
      'v1/collection/testCollection/updateMany',
      { filter: filter, update: update }
    )
  })

  test('findOneAndUpdate calls the appropriate endpoint', async () => {
    const filter = { name: 'Item1' }
    const update = { $set: { price: 150 } }
    await collection.findOneAndUpdate(filter, update)
    expect(axiosClient).toHaveCalledServicePost(
      'v1/collection/testCollection/findOneAndUpdate',
      { filter: filter, update: update }
    )
  })

  test('findOneAndReplace calls the appropriate endpoint', async () => {
    const filter = { name: 'Item1' }
    const replacement = { name: 'NewItem', price: 200 }
    await collection.findOneAndReplace(filter, replacement)
    expect(axiosClient).toHaveCalledServicePost(
      'v1/collection/testCollection/findOneAndReplace',
      { filter: filter, replacement: replacement }
    )
  })

  test('findOneAndDelete calls the appropriate endpoint', async () => {
    const filter = { name: 'Item1' }
    await collection.findOneAndDelete(filter)
    expect(axiosClient).toHaveCalledServicePost('v1/collection/testCollection/findOneAndDelete', { filter: filter })
  })

  test('deleteOne calls the appropriate endpoint', async () => {
    const filter = { name: 'Item1' }
    await collection.deleteOne(filter)
    expect(axiosClient).toHaveCalledServicePost('v1/collection/testCollection/deleteOne', { filter: filter })
  })

  test('deleteMany calls the appropriate endpoint', async () => {
    const filter = { category: 'electronics' }
    await collection.deleteMany(filter)
    expect(axiosClient).toHaveCalledServicePost('v1/collection/testCollection/deleteMany', { filter: filter })
  })

  test('countDocuments calls the appropriate endpoint', async () => {
    const filter = { category: 'electronics' }
    await collection.countDocuments(filter)
    expect(axiosClient).toHaveCalledServicePost('v1/collection/testCollection/countDocuments', { filter: filter })
  })

  test('aggregate calls the appropriate endpoint', async () => {
    const pipeline = [
      { $match: { category: 'electronics' } },
      { $group: { _id: '$category', total: { $sum: '$price' } } }
    ]
    // .aggregate() doesn't make a request until iteration actually starts
    const cursor = collection.aggregate(pipeline)
    expect(axiosClient).not.toHaveCalledServicePost('v1/collection/testCollection/aggregate')
    await cursor.hasNext()
    expect(axiosClient).toHaveCalledServicePost('v1/collection/testCollection/aggregate', { pipeline: pipeline })
    expect(cursor).toHaveProperty('constructor.name', 'AggregateCursor')
  })

  test('drop calls the appropriate endpoint', async () => {
    await collection.drop()
    expect(axiosClient).toHaveCalledServicePost('v1/collection/testCollection/drop', {})
  })

  test('distinct calls the appropriate endpoint', async () => {
    const field = 'category'
    const filter = { price: { $gt: 100 } }
    await collection.distinct(field, filter)
    expect(axiosClient).toHaveCalledServicePost(
      'v1/collection/testCollection/distinct',
      { field: field, filter: filter }
    )
  })

  test('estimatedDocumentCount calls the appropriate endpoint', async () => {
    await collection.estimatedDocumentCount()
    expect(axiosClient).toHaveCalledServicePost('v1/collection/testCollection/estimatedDocumentCount', {})
  })

  test('renameCollection calls the appropriate endpoint', async () => {
    const newCollectionName = 'renamedCollection'
    await collection.renameCollection(newCollectionName)
    expect(axiosClient).toHaveCalledServicePost(
      'v1/collection/testCollection/renameCollection',
      { name: newCollectionName }
    )
  })

  test('stats calls the appropriate endpoint', async () => {
    await collection.stats()
    expect(axiosClient).toHaveCalledServicePost('v1/collection/testCollection/stats', {})
  })

  test('validate calls the appropriate endpoint', async () => {
    await collection.validate()
    expect(axiosClient).toHaveCalledServicePost('v1/collection/testCollection/validate', {})
  })

  test('createIndex calls the appropriate endpoint', async () => {
    await collection.createIndex({ category: 1, price: -1 }, { name: 'CategoryPriceIndex' })
    expect(axiosClient).toHaveCalledServicePost(
      'v1/collection/testCollection/createIndex',
      {
        specification: {
          category: 1,
          price: -1
        },
        options: {
          name: 'CategoryPriceIndex'
        }
      }
    )
  })

  test('getIndexes calls the appropriate endpoint', async () => {
    await collection.getIndexes()
    expect(axiosClient).toHaveCalledServicePost('v1/collection/testCollection/getIndexes', {})
  })

  test('hideIndex calls the appropriate endpoint', async () => {
    await collection.hideIndex('PriceIndex')
    expect(axiosClient).toHaveCalledServicePost('v1/collection/testCollection/hideIndex', { index: 'PriceIndex' })
  })

  test('unhideIndex calls the appropriate endpoint', async () => {
    await collection.unhideIndex('PriceIndex')
    expect(axiosClient).toHaveCalledServicePost('v1/collection/testCollection/unhideIndex', { index: 'PriceIndex' })
  })

  test('dropIndex calls the appropriate endpoint', async () => {
    await collection.dropIndex('PriceIndex')
    expect(axiosClient).toHaveCalledServicePost('v1/collection/testCollection/dropIndex', { index: 'PriceIndex' })
  })

  test('bulkWrite calls the appropriate endpoint', async () => {
    const operations = [
      { insertOne: { document: { name: 'Item1', price: 100 } } },
      { updateOne: { filter: { name: 'Item2' }, update: { $set: { price: 200 } } } },
      { deleteOne: { filter: { name: 'Item3' } } }
    ]
    await collection.bulkWrite(operations)
    expect(axiosClient).toHaveCalledServicePost('v1/collection/testCollection/bulkWrite', { operations: operations })
  })

  test('find calls the appropriate endpoint', async () => {
    // .find() doesn't make a request until iteration actually starts
    const cursor = await collection.find({ name: 'Item1' })
    expect(axiosClient).not.toHaveCalledServicePost('v1/collection/testCollection/find')
    await cursor.hasNext()
    expect(axiosClient).toHaveCalledServicePost('v1/collection/testCollection/find', { filter: { name: 'Item1' } })
    expect(cursor).toHaveProperty('constructor.name', 'FindCursor')
  })
})
