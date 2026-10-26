/*
Copyright 2026 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/
import type {
  AggregateCursor, DbBase, DbClient, DbCollection, DbError, Document, FindCursor
} from '@adobe/aio-lib-db'
import type { Long } from 'bson'
import type { Readable } from 'node:stream'

interface User {
  name: string
  age: number
}

function expectType<T>(_value: T): void {}

export async function exercise(libDb: typeof import('@adobe/aio-lib-db')) {
  const db = await libDb.init({ token: 'compile-only', region: 'AmEr', ow: { namespace: 'compile-only' } })
  expectType<DbBase>(db)
  const client = await db.connect()
  expectType<DbClient>(client)
  const users = client.collection<User>('users')
  expectType<DbCollection<User>>(users)
  expectType<DbCollection<User>>(await client.createCollection<User>('users', { validator: { $jsonSchema: {} } }))
  expectType<Document[]>(await client.listCollections({ name: 'users' }, { nameOnly: true }))
  expectType<Document>(await client.dbStats({ scale: 1024 }))
  expectType<Document>(await client.orgStats())
  await db.ping()
  await db.provisionStatus()
  await db.provisionRequest()
  await db.deleteDatabase()

  expectType<Document>(await users.insertOne({ name: 'Ada', age: 30 }))
  expectType<Document>(await users.insertMany([{ name: 'Ada', age: 30 }], { ordered: true }))
  expectType<User | null>(await users.findOne({ age: { $gte: 18 } }))
  users.find({ name: /^Ada/ })
  client.collection<{ tags: string[] }>('tagged').find({ tags: { $in: ['typed'] } })
  client.collection<{ tags: string[] }>('tagged').find({ tags: 'typed' })
  expectType<User | null>(await users.findOneAndUpdate({}, { $set: { age: 31 } }, { returnDocument: 'after' }))
  expectType<User | null>(await users.findOneAndReplace({}, { name: 'Ada', age: 31 }))
  expectType<User | null>(await users.findOneAndDelete({ name: 'Ada' }))
  expectType<Document>(await users.updateOne({}, { $set: { age: 31 } }, { upsert: true }))
  expectType<Document>(await users.updateMany({}, { $inc: { age: 1 } }))
  expectType<Document>(await users.replaceOne({}, { name: 'Ada', age: 31 }))
  expectType<Document>(await users.deleteOne({}))
  expectType<Document>(await users.deleteMany({}))
  expectType<Document>(await users.bulkWrite([
    { insertOne: { document: { name: 'Ada', age: 30 } } },
    { updateOne: { filter: { name: 'Ada' }, update: { $set: { age: 31 } } } },
    { deleteOne: { filter: { name: 'Ada' } } }
  ]))
  expectType<unknown[]>(await users.distinct('name'))
  expectType<number>(await users.countDocuments({}))
  expectType<number>(await users.count())
  expectType<number>(await users.estimatedDocumentCount())
  expectType<User[]>(await users.findArray())
  expectType<Document[]>(await users.getIndexes())
  await users.createIndex({ name: 1, age: -1 }, { name: 'users', unique: true })
  await users.createIndex({ name: 'text', location: '2dsphere' })
  await users.dropIndex('users')
  expectType<Document>(await users.stats({ scale: 1024 }))
  expectType<void>(await users.renameCollection('renamed'))
  expectType<void>(await users.drop())

  const cursor = users.find({ age: { $gte: 18 } }, { batchSize: 10, comment: 'test' })
    .filter({ name: 'Ada' }).sort('age', -1).project<User>({ name: 1, age: 1 }).limit(10).skip(1).batchSize(5)
  expectType<FindCursor<User>>(cursor)
  expectType<Long | number | undefined>(cursor.id)
  expectType<boolean>(cursor.closed)
  expectType<boolean>(await cursor.hasNext())
  expectType<User | null>(await cursor.next())
  expectType<User[]>(await cursor.toArray())
  for await (const user of cursor) expectType<User>(user)
  expectType<Readable>(cursor.stream())
  expectType<Readable>(cursor.stream(user => user.name))
  expectType<string[]>(await users.find().map(async user => user.name).limit(1).map(name => name.toUpperCase()).toArray())
  expectType<string | null>(await users.find().map(user => user.name).next())
  cursor.on('error', error => expectType<Error>(error))
  expectType<void>(await cursor.close())

  const aggregate = users.aggregate<{ count: number }>([{ $count: 'count' }])
    .addStage({ $match: {} }).match({ age: { $gte: 18 } }).lookup({ from: 'other', as: 'joined' })
    .project({ count: 1 }).redact({ $cond: [] }).group({ _id: null }).skip(1)
    .unwind('$joined').geoNear({ near: [0, 0] }).limit(1).sort({ count: -1 }).out('totals').batchSize(5)
  expectType<AggregateCursor<Document>>(aggregate)
  expectType<number[]>(await users.aggregate<{ count: number }>().map(doc => doc.count).toArray())
  expectType<Document>(await users.aggregate().explain())
  expectType<void>(await client.close())

  try {
    await users.findOne({})
  } catch (error) {
    if (error instanceof Error && error.name === 'DbError') {
      const dbError = error as DbError
      expectType<string | null | undefined>(dbError.requestId)
      expectType<number | undefined>(dbError.httpStatusCode)
      expectType<unknown>(dbError.cause)
    }
  }

  // @ts-expect-error The package does not export a DbError constructor.
  new libDb.DbError('not exported')
  // @ts-expect-error The package does not export a DbClient constructor.
  new libDb.DbClient()
  // @ts-expect-error Token is required.
  libDb.init({})
  // @ts-expect-error Tokens are strings.
  libDb.init({ token: 42 })
  // @ts-expect-error Region must be a string; runtime validates it for the environment.
  libDb.init({ token: 'compile-only', region: 42 })
  // @ts-expect-error Namespace must be a string.
  libDb.init({ token: 'compile-only', ow: { namespace: 42 } })
  // @ts-expect-error Collection name must be a string.
  client.collection(42)
  // @ts-expect-error Collection schema rejects incorrect field values.
  users.insertOne({ name: 'Ada', age: 'thirty' })
  // @ts-expect-error Documents must be an array.
  users.insertMany({ name: 'Ada', age: 30 })
  // @ts-expect-error Filters must be objects.
  users.find('Ada')
  // @ts-expect-error Known schema fields retain their value types.
  users.find({ age: 'thirty' })
  // @ts-expect-error Numeric options must remain numeric.
  users.find({}, { limit: 'ten' })
  // @ts-expect-error Known update fields retain their value types.
  users.updateOne({}, { $set: { age: 'thirty' } })
  // @ts-expect-error Bulk updates must have an object filter.
  users.bulkWrite([{ updateOne: { filter: 42, update: {} } }])
  // @ts-expect-error Pagination arguments are numbers.
  cursor.limit('ten')
  // @ts-expect-error Cursor transforms receive the collection schema.
  users.find().map(user => user.missing)
  // @ts-expect-error map transforms change the cursor result type.
  expectType<User[]>(await users.find().map(user => user.name).toArray())
  // @ts-expect-error next can return null.
  expectType<User>(await users.find().next())
  // @ts-expect-error find returns a cursor, not a Promise.
  expectType<Promise<FindCursor<User>>>(users.find())
  // @ts-expect-error createCollection is asynchronous.
  expectType<DbCollection<User>>(client.createCollection<User>('users'))
  // @ts-expect-error Index direction is not a numeric string.
  users.createIndex({ age: '1' })
  // @ts-expect-error Index names are strings.
  users.dropIndex(42)
  // @ts-expect-error returnDocument has two supported values.
  users.findOneAndUpdate({}, {}, { returnDocument: 'later' })
  // @ts-expect-error Pipelines are arrays.
  users.aggregate({ $match: {} })
  // @ts-expect-error This driver does not implement MongoDB's hint cursor method.
  users.find().hint({ age: 1 })
  // @ts-expect-error Undocumented response fields are not implicitly any.
  expectType<string>((await users.insertOne({ name: 'Ada', age: 30 })).arbitrary)
}
