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

  type ReadPreferenceMode = 'primary' | 'primaryPreferred' | 'secondary' | 'secondaryPreferred' | 'nearest'

  interface OperationOptions {
    readPreference?: ReadPreferenceMode | {
      mode: ReadPreferenceMode
    }
    ignoreUndefined?: boolean
    enableUtf8Validation?: boolean
  }

  type ExplainVerbosity = 'queryPlanner' | 'executionStats'

  interface WriteConcern {
    w?: number | 'majority'
    journal?: boolean
    wtimeoutMS?: number
  }

  interface CommandOperationOptions<TVerbosity extends ExplainVerbosity = ExplainVerbosity>
    extends OperationOptions {
    readConcern?: { level: 'local' | 'available' | 'majority' }
    /** Accepted for compatibility; DocumentDB fixes durability and ignores these settings. */
    writeConcern?: WriteConcern
    maxTimeMS?: number
    comment?: string
    explain?: false | TVerbosity | { verbosity: TVerbosity; maxTimeMS?: number }
  }

  interface InsertOneOptions extends Omit<CommandOperationOptions, 'explain'> {
    bypassDocumentValidation?: boolean
  }

  interface InsertManyOptions extends Omit<CommandOperationOptions, 'explain'> {
    bypassDocumentValidation?: boolean
    ordered?: boolean
  }

  interface FindOptions {
    sort?: Document
    projection?: Document
    hint?: string | Document
    skip?: number
    limit?: number
    batchSize?: number
    singleBatch?: boolean
    /** Accepted for compatibility; has no effect on ABDB's non-sharded replica sets. */
    allowPartialResults?: boolean
    comment?: string
    maxTimeMS?: number
    readConcern?: CommandOperationOptions['readConcern']
  }

  interface FindOneOptions extends Omit<CommandOperationOptions, 'explain' | 'writeConcern'> {
    limit?: number
    sort?: Document
    projection?: Document
    skip?: number
    hint?: string | Document
    batchSize?: number
    singleBatch?: boolean
    /** Accepted for compatibility; has no effect on ABDB's non-sharded replica sets. */
    allowPartialResults?: boolean
  }

  interface FindOneAndUpdateOptions extends CommandOperationOptions<'queryPlanner'> {
    arrayFilters?: Document[]
    bypassDocumentValidation?: boolean
    hint?: string | Document
    projection?: Document
    returnDocument?: 'before' | 'after'
    sort?: Document
    upsert?: boolean
    includeResultMetadata?: boolean
  }

  interface FindOneAndReplaceOptions extends CommandOperationOptions<'queryPlanner'> {
    bypassDocumentValidation?: boolean
    hint?: string | Document
    projection?: Document
    returnDocument?: 'before' | 'after'
    sort?: Document
    upsert?: boolean
    includeResultMetadata?: boolean
  }

  interface FindOneAndDeleteOptions extends CommandOperationOptions<'queryPlanner'> {
    hint?: string | Document
    projection?: Document
    sort?: Document
    includeResultMetadata?: boolean
  }

  interface UpdateOptions extends CommandOperationOptions<'queryPlanner'> {
    arrayFilters?: Document[]
    bypassDocumentValidation?: boolean
    hint?: string | Document
    upsert?: boolean
  }

  interface ReplaceOptions extends Omit<CommandOperationOptions, 'explain'> {
    bypassDocumentValidation?: boolean
    hint?: string | Document
    upsert?: boolean
  }

  interface DeleteOptions extends CommandOperationOptions<'queryPlanner'> {
    ordered?: boolean
  }

  interface BulkWriteOptions extends Omit<CommandOperationOptions, 'explain'> {
    ordered?: boolean
    bypassDocumentValidation?: boolean
  }

  interface AggregateOptions {
    /** Use AggregateCursor.explain() instead of requesting a non-cursor response here. */
    explain?: never
    batchSize?: number
    maxTimeMS?: number
    bypassDocumentValidation?: boolean
    readConcern?: CommandOperationOptions['readConcern']
    hint?: string | Document
    comment?: string
    /** Accepted for compatibility; DocumentDB fixes durability and ignores these settings. */
    writeConcern?: WriteConcern
  }

  interface AggregateStageDefinitions {
    $addFields: Document
    $count: string
    $geoNear: Document
    $group: Document
    $limit: number
    $lookup: Document & { pipeline?: AggregatePipeline }
    $match: Document
    $out: string
    $project: Document
    $redact: Document | '$$DESCEND' | '$$PRUNE' | '$$KEEP'
    $replaceRoot: { newRoot: unknown }
    $sample: { size: number }
    $skip: number
    $sort: Document
    $unwind: string | {
      path: string
      includeArrayIndex?: string
      preserveNullAndEmptyArrays?: boolean
    }
  }

  /** Exactly one supported stage per object; expressions remain open service documents. */
  type AggregateStage = {
    [Stage in keyof AggregateStageDefinitions]:
      { [Key in Stage]: AggregateStageDefinitions[Key] }
      & { [Key in Exclude<keyof AggregateStageDefinitions, Stage>]?: never }
  }[keyof AggregateStageDefinitions]

  type AggregatePipeline = AggregateStage[]

  interface CountDocumentsOptions extends CommandOperationOptions {
    batchSize?: number
    bypassDocumentValidation?: boolean
    hint?: string | Document
  }

  interface RenameCollectionOptions extends Omit<CommandOperationOptions, 'explain'> {
    dropTarget?: boolean
  }

  interface StatsOptions {
    scale?: number
  }

  interface ListCollectionsOptions extends Omit<CommandOperationOptions, 'explain' | 'writeConcern'> {
    nameOnly?: boolean
  }

  interface CreateCollectionOptions extends Omit<CommandOperationOptions, 'explain'> {
    validator?: Document
    validationLevel?: 'off' | 'strict' | 'moderate'
    validationAction?: 'error'
  }

  type IndexSpecification = Record<string, 1 | -1 | 'text' | '2dsphere'>

  interface IndexOptions extends Omit<CommandOperationOptions, 'explain'> {
    /** Accepted for compatibility; does not change index creation behavior. */
    background?: boolean
    unique?: boolean
    name?: string
    partialFilterExpression?: Document
    sparse?: boolean
    expireAfterSeconds?: number
    weights?: Record<string, number>
  }

  type BulkWriteOperation<T extends object = Document> =
    | { insertOne: { document: T } }
    | { updateOne: { filter: Filter<T>; update: Update<T>; upsert?: boolean } }
    | { updateMany: { filter: Filter<T>; update: Update<T>; upsert?: boolean } }
    | { replaceOne: { filter: Filter<T>; replacement: T; upsert?: boolean } }
    | { deleteOne: { filter: Filter<T> } }
    | { deleteMany: { filter: Filter<T> } }

  interface ModifyResult<T> extends Document {
    value: T | null
  }

  type ModifyOptions<O, Metadata extends boolean = boolean> =
    Omit<O, 'explain' | 'includeResultMetadata'> & {
      explain?: never
      includeResultMetadata?: Metadata
    }

  /**
   * T describes application documents, not runtime validation. Include _id in T if
   * needed. Projections and aggregation results must describe their output explicitly.
   * Write/admin response fields remain unknown where the service schema is unspecified.
   */
  interface DbCollection<T extends object = Document> {
    name: string
    db: DbBase
    client: DbClient
    insertOne(document: T, options?: InsertOneOptions): Promise<Document>
    insertMany(documents: T[], options?: InsertManyOptions): Promise<Document>
    findOne<R extends object = T>(filter: Filter<T>, options?: FindOneOptions): Promise<R | null>
    find(filter?: Filter<T>, options?: FindOptions): FindCursor<T, T>
    findOneAndUpdate<R extends object = T>(
      filter: Filter<T>, update: Update<T>,
      options: ModifyOptions<FindOneAndUpdateOptions, true> & { includeResultMetadata: true }
    ): Promise<ModifyResult<R>>
    findOneAndUpdate<R extends object = T>(
      filter: Filter<T>, update: Update<T>, options?: ModifyOptions<FindOneAndUpdateOptions, false>
    ): Promise<R | null>
    findOneAndUpdate<R extends object = T>(
      filter: Filter<T>, update: Update<T>, options: ModifyOptions<FindOneAndUpdateOptions>
    ): Promise<R | ModifyResult<R> | null>
    findOneAndUpdate<R extends object = T>(
      filter: Filter<T>, update: Update<T>, options?: FindOneAndUpdateOptions
    ): Promise<R | Document | null>
    findOneAndReplace<R extends object = T>(
      filter: Filter<T>, replacement: T,
      options: ModifyOptions<FindOneAndReplaceOptions, true> & { includeResultMetadata: true }
    ): Promise<ModifyResult<R>>
    findOneAndReplace<R extends object = T>(
      filter: Filter<T>, replacement: T, options?: ModifyOptions<FindOneAndReplaceOptions, false>
    ): Promise<R | null>
    findOneAndReplace<R extends object = T>(
      filter: Filter<T>, replacement: T, options: ModifyOptions<FindOneAndReplaceOptions>
    ): Promise<R | ModifyResult<R> | null>
    findOneAndReplace<R extends object = T>(
      filter: Filter<T>, replacement: T, options?: FindOneAndReplaceOptions
    ): Promise<R | Document | null>
    findOneAndDelete<R extends object = T>(
      filter: Filter<T>,
      options: ModifyOptions<FindOneAndDeleteOptions, true> & { includeResultMetadata: true }
    ): Promise<ModifyResult<R>>
    findOneAndDelete<R extends object = T>(
      filter: Filter<T>, options?: ModifyOptions<FindOneAndDeleteOptions, false>
    ): Promise<R | null>
    findOneAndDelete<R extends object = T>(
      filter: Filter<T>, options: ModifyOptions<FindOneAndDeleteOptions>
    ): Promise<R | ModifyResult<R> | null>
    findOneAndDelete<R extends object = T>(filter: Filter<T>, options?: FindOneAndDeleteOptions): Promise<R | Document | null>
    /** CLI-only first batch; use find().toArray() in application code. */
    findArray(filter?: Filter<T>, options?: Omit<FindOptions, 'batchSize' | 'singleBatch'>): Promise<T[]>
    updateOne(filter: Filter<T>, update: Update<T>, options?: UpdateOptions): Promise<Document>
    updateMany(filter: Filter<T>, update: Update<T>, options?: UpdateOptions): Promise<Document>
    replaceOne(filter: Filter<T>, replacement: T, options?: ReplaceOptions): Promise<Document>
    deleteOne(filter: Filter<T>, options?: DeleteOptions): Promise<Document>
    deleteMany(filter: Filter<T>, options?: DeleteOptions): Promise<Document>
    aggregate<R = Document>(pipeline?: AggregatePipeline, options?: AggregateOptions): AggregateCursor<R>
    bulkWrite(operations: BulkWriteOperation<T>[], options?: BulkWriteOptions): Promise<Document>
    getIndexes(): Promise<Document[]>
    /** The service payload is not normalized to a name by this library. */
    createIndex(specification: IndexSpecification, options?: IndexOptions): Promise<unknown>
    dropIndex(index: string, options?: Omit<CommandOperationOptions, 'explain'>): Promise<Document>
    distinct(
      field: string | Document, filter: Filter<T>,
      options: CommandOperationOptions & { explain: NonNullable<CommandOperationOptions['explain']> }
    ): Promise<Document>
    distinct(
      field: string | Document, filter?: Filter<T>,
      options?: Omit<CommandOperationOptions, 'explain'> & { explain?: never }
    ): Promise<unknown[]>
    distinct(field: string | Document, filter?: Filter<T>, options?: CommandOperationOptions): Promise<Document | unknown[]>
    countDocuments(filter?: Filter<T>, options?: CountDocumentsOptions): Promise<number>
    /** @deprecated Use countDocuments instead. */
    count(filter?: Filter<T>, options?: CountDocumentsOptions): Promise<number>
    estimatedDocumentCount(options?: Omit<CommandOperationOptions, 'explain'>): Promise<number>
    drop(options?: Omit<CommandOperationOptions, 'explain'>): Promise<void>
    /** Updates this collection handle's name after the service request completes. */
    renameCollection(newCollectionName: string, options?: RenameCollectionOptions): Promise<void>
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
    addStage(stage: AggregateStage): this
    group<R extends object = Document>(groupSpec: AggregateStageDefinitions['$group']): AggregateCursor<R>
    limit(limit: AggregateStageDefinitions['$limit']): this
    match(matchSpec: AggregateStageDefinitions['$match']): this
    out(outSpec: AggregateStageDefinitions['$out']): this
    project<R extends object = Document>(projectSpec: AggregateStageDefinitions['$project']): AggregateCursor<R>
    lookup(lookupSpec: AggregateStageDefinitions['$lookup']): this
    redact(redactSpec: AggregateStageDefinitions['$redact']): this
    skip(skip: AggregateStageDefinitions['$skip']): this
    sort(sortSpec: AggregateStageDefinitions['$sort']): this
    unwind(unwindSpec: AggregateStageDefinitions['$unwind']): this
    geoNear(geoNearSpec: AggregateStageDefinitions['$geoNear']): this
    map<R>(transform: (document: T) => R | Promise<R>): AggregateCursor<R>
  }
}

export = libDb
