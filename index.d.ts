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
import type { Long } from 'bson'
import type { Readable } from 'node:stream'

declare namespace libDb {
  /** Open service documents. Unspecified fields must be narrowed before use. */
  type Document = Record<string, unknown>

  interface InitOptions {
    token: string
    /** Case-insensitive. Production: amer, emea, apac, aus; stage: amer, amer2. */
    region?: string
    /** Namespace may instead be supplied by __OW_NAMESPACE. */
    ow?: { namespace?: string }
  }

  /**
   * Initialize the namespace-scoped database handle; does not provision a database.
   * Region selection prefers app.config.yaml over this configuration.
   */
  function init(config: InitOptions): Promise<DbBase>

  /** Error shape only: there is no exported DbError constructor. Other errors can propagate. */
  interface DbError extends Error {
    requestId: string | null
    httpStatusCode?: number
  }

  /** Service responses are returned unchanged after Extended JSON decoding. */
  interface DbBase {
    runtimeNamespace: string
    accessToken: string
    region: string
    serviceUrl: string
    provisionRequest(): Promise<Document>
    provisionStatus(): Promise<Document>
    connect(): Promise<DbClient>
    ping(): Promise<unknown>
    deleteDatabase(): Promise<Document>
  }

  interface DbClient {
    db: DbBase
    dbStats(options?: StatsOptions): Promise<Document>
    orgStats(options?: StatsOptions): Promise<Document>
    listCollections(filter?: Document, options?: ListCollectionsOptions): Promise<Document[]>
    collection<T extends object = Document>(name: string): DbCollection<T>
    createCollection<T extends object = Document>(name: string, options?: CreateCollectionOptions): Promise<DbCollection<T>>
    /** Close active cursor sessions. */
    close(): Promise<void>
  }

  /**
   * Known fields are checked against T. Dotted paths and additional service operators
   * remain open; this is not a complete MongoDB query-language validator.
   */
  type Filter<T extends object = Document> = {
    [K in keyof T]?: Condition<T[K]>
  } & Document

  type Condition<T> = T | QueryOperators<T>
    | (T extends string ? RegExp : never)
    | (T extends ReadonlyArray<infer Element> ? Condition<Element> : never)

  interface QueryOperators<T> extends Document {
    $eq?: T
    $ne?: T
    $gt?: T
    $gte?: T
    $lt?: T
    $lte?: T
    $in?: T[]
    $nin?: T[]
    $exists?: boolean
  }

  type Update<T extends object = Document> = Document & {
    $set?: Partial<T> & Document
    $inc?: Record<string, number>
  }

  /** Forwarded to the service. Known option values are checked; other service keys stay open. */
  interface Options extends Document {
    comment?: unknown
    maxTimeMS?: number
  }

  interface WriteOptions extends Options {
    ordered?: boolean
    upsert?: boolean
  }

  interface FindOptions extends Options {
    projection?: Document
    sort?: Document
    limit?: number
    skip?: number
    batchSize?: number
  }

  interface FindOneAndModifyOptions extends FindOptions, WriteOptions {
    returnDocument?: 'before' | 'after'
  }

  interface AggregateOptions extends Options {
    batchSize?: number
    allowDiskUse?: boolean
    explain?: boolean
  }

  interface StatsOptions extends Options {
    scale?: number
  }

  interface ListCollectionsOptions extends Options {
    nameOnly?: boolean
    authorizedCollections?: boolean
  }

  interface CreateCollectionOptions extends Options {
    validator?: Document
  }

  type IndexSpecification = Record<string, 1 | -1 | 'text' | '2dsphere'>

  interface IndexOptions extends Options {
    name?: string
    unique?: boolean
    sparse?: boolean
    expireAfterSeconds?: number
  }

  type BulkWriteOperation<T extends object = Document> =
    | { insertOne: { document: T } }
    | { updateOne: { filter: Filter<T>; update: Update<T>; upsert?: boolean } }
    | { updateMany: { filter: Filter<T>; update: Update<T>; upsert?: boolean } }
    | { replaceOne: { filter: Filter<T>; replacement: T; upsert?: boolean } }
    | { deleteOne: { filter: Filter<T> } }
    | { deleteMany: { filter: Filter<T> } }

  /**
   * T describes application documents, not runtime validation. Include _id in T if
   * needed. Projections and aggregation results must describe their output explicitly.
   * Write/admin response fields remain unknown where the service schema is unspecified.
   */
  interface DbCollection<T extends object = Document> {
    name: string
    db: DbBase
    client: DbClient
    insertOne(document: T, options?: WriteOptions): Promise<Document>
    insertMany(documents: T[], options?: WriteOptions): Promise<Document>
    findOne<R extends object = T>(filter: Filter<T>, options?: FindOptions): Promise<R | null>
    find(filter?: Filter<T>, options?: FindOptions): FindCursor<T, T>
    findOneAndUpdate<R extends object = T>(
      filter: Filter<T>, update: Update<T>, options?: FindOneAndModifyOptions
    ): Promise<R | null>
    findOneAndReplace<R extends object = T>(
      filter: Filter<T>, replacement: T, options?: FindOneAndModifyOptions
    ): Promise<R | null>
    findOneAndDelete<R extends object = T>(filter: Filter<T>, options?: FindOptions): Promise<R | null>
    /** CLI-only first batch; use find().toArray() in application code. */
    findArray(filter?: Filter<T>, options?: FindOptions): Promise<T[]>
    updateOne(filter: Filter<T>, update: Update<T>, options?: WriteOptions): Promise<Document>
    updateMany(filter: Filter<T>, update: Update<T>, options?: WriteOptions): Promise<Document>
    replaceOne(filter: Filter<T>, replacement: T, options?: WriteOptions): Promise<Document>
    deleteOne(filter: Filter<T>, options?: Options): Promise<Document>
    deleteMany(filter: Filter<T>, options?: Options): Promise<Document>
    aggregate<R = Document>(pipeline?: Document[], options?: AggregateOptions): AggregateCursor<R>
    bulkWrite(operations: BulkWriteOperation<T>[], options?: WriteOptions): Promise<Document>
    getIndexes(): Promise<Document[]>
    /** The service payload is not normalized to a name by this library. */
    createIndex(specification: IndexSpecification, options?: IndexOptions): Promise<unknown>
    dropIndex(index: string, options?: Options): Promise<Document>
    distinct(field: string | Document, filter?: Filter<T>, options?: Options): Promise<unknown[]>
    countDocuments(filter?: Filter<T>, options?: Options): Promise<number>
    /** @deprecated Use countDocuments instead. */
    count(filter?: Filter<T>, options?: Options): Promise<number>
    estimatedDocumentCount(options?: Options): Promise<number>
    drop(options?: Options): Promise<void>
    /** Updates this collection handle's name after the service request completes. */
    renameCollection(newCollectionName: string, options?: Options): Promise<void>
    stats(options?: StatsOptions): Promise<Document>
  }

  /**
   * Readable object-mode cursor. Configuration throws after iteration starts.
   * map() mutates the same cursor and awaits async transformations.
   */
  interface AbstractDbCursor<T> extends Omit<Readable, 'map' | 'filter' | 'emit' | typeof Symbol.asyncIterator> {
    /** Undefined until the first request. */
    readonly id: Long | number | undefined
    readonly closed: boolean
    hasNext(): Promise<boolean>
    next(): Promise<T | null>
    toArray(): Promise<T[]>
    close(): Promise<void>
    batchSize(batchSize: number): this
    map<R>(transform: (document: T) => R | Promise<R>): AbstractDbCursor<R>
    [Symbol.asyncIterator](): AsyncGenerator<T, void, unknown>
    /** stream's optional transform is synchronous, unlike map. */
    stream(transform?: (document: T) => unknown): Readable
    /** Unlike Readable.emit, the cursor override does not return a boolean. */
    emit(event: string, ...args: unknown[]): void
  }

  interface FindCursor<T = Document, TSchema extends object = Document> extends AbstractDbCursor<T> {
    filter(filter: Filter<TSchema>): this
    /** Formatting is delegated to the service. */
    sort(sort: string | string[] | Document | number, direction?: string | Document | number): this
    project<R extends object = Document>(projection: Document): FindCursor<R, TSchema>
    limit(limit: number): this
    skip(skip: number): this
    map<R>(transform: (document: T) => R | Promise<R>): FindCursor<R, TSchema>
  }

  interface AggregateCursor<T = Document> extends AbstractDbCursor<T> {
    /** Executes immediately and exhausts the cursor. */
    explain(): Promise<Document>
    addStage(stage: Document): this
    group<R extends object = Document>(groupSpec: Document): AggregateCursor<R>
    limit(limit: number): this
    match(matchSpec: Document): this
    out(outSpec: string | Document): this
    project<R extends object = Document>(projectSpec: Document): AggregateCursor<R>
    lookup(lookupSpec: Document): this
    redact(redactSpec: Document): this
    skip(skip: number): this
    sort(sortSpec: string | Document | number): this
    unwind(unwindSpec: string | Document): this
    geoNear(geoNearSpec: Document): this
    map<R>(transform: (document: T) => R | Promise<R>): AggregateCursor<R>
  }
}

export = libDb
