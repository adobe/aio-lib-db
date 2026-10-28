# aio-lib-db

**aio-lib-db** is a powerful document database library for Adobe I/O Runtime applications. It provides structured, queryable, and flexible data persistence with MongoDB-like query capabilities.

---

## Installation

Install `aio-lib-db` from npm:

```bash
npm install @adobe/aio-lib-db
```

## Documentation

Main documentation for App Builder Database Storage:

* [Getting Started with Database Storage](https://developer.adobe.com/app-builder/docs/guides/app_builder_guides/storage/database)

---

## Why Use aio-lib-db?

- **MongoDB-like Syntax**: Familiar query language and operations
- **Powerful Querying**: Complex filtering, sorting, and aggregation
- **Cursor Support**: Memory-efficient iteration over large datasets
- **Method Chaining**: Fluent API for building complex queries
- **Type Safety**: Comprehensive input validation and error handling
- **Streaming Support**: Process large datasets without memory issues
- **Native Integration**: Built specifically for Adobe I/O Runtime

---

## TypeScript

Starting with 1.1.0, this package includes declarations. The runtime remains
CommonJS and supports Node.js 18 and later. Declarations are tested with
TypeScript 5.7, 6.0 and 7.0 using strict checking, including declaration checking
(`skipLibCheck: false`). Node type definitions (`@types/node`) are required.

Supported resolution modes are `node16`, `nodenext` and `bundler`. Legacy `node`
resolution is also tested on TypeScript 5.7; newer compilers may deprecate or
remove that mode.

CommonJS TypeScript:

```typescript
import libDb = require('@adobe/aio-lib-db')
```

ES modules, or CommonJS TypeScript with `esModuleInterop: true`:

```typescript
import libDb from '@adobe/aio-lib-db'
```

Named `init` imports also work. Only `init` is a runtime export; types such as
`DbClient`, `DbCollection`, `FindCursor` and `DbError` are type-only exports, not
constructors.

```typescript
import libDb from '@adobe/aio-lib-db'

interface User {
  name: string
  age: number
}

async function adultNames(token: string) {
  const db = await libDb.init({ token })
  const client = await db.connect()
  try {
    const users = client.collection<User>('users')
    return await users.find({ age: { $gte: 18 } })
      .map(user => user.name)
      .toArray()
  } finally {
    await client.close()
  }
}
```

Collection type parameters describe application documents; they do not validate
stored data. Include `_id` in your schema when using it. Supply the output type
when a projection or aggregation changes the document shape. Cursor `next()`
returns `null` at exhaustion; `map()` also supports asynchronous transformations.
Configure cursors before iteration starts, or the runtime throws. `stream()`
returns a Node readable stream with an optional synchronous transform.

These declarations do not promise full MongoDB-driver compatibility. Options are
operation-specific: the library forwards them, but the service rejects unknown
option names. Schema fields are checked; dotted paths, query operators and
aggregation expressions remain open. Pipeline stages are restricted to the
supported stage names, with one stage per object, including nested lookup
pipelines. Service write/admin response objects use `Record<string, unknown>`, and unspecified
payloads such as the `createIndex()` response use `unknown`: narrow those values
before use instead of assuming MongoDB result fields. This library passes service
payloads through after Extended JSON decoding. See the
[compatibility guide](https://developer.adobe.com/app-builder/docs/guides/app_builder_guides/storage/db-mongo-compatibility)
for service support; only cursor methods implemented by this library are exposed.
Errors can be `DbError`-shaped (including `requestId`, `httpStatusCode` and an
optional `cause`) or other errors; narrow caught `unknown` values before use.

`writeConcern`, `allowPartialResults` and index `background` are accepted
compatibility options but do not change backend behavior. DocumentDB fixes
durability, ABDB uses non-sharded replica sets, and index builds do not use the
legacy background setting. Count `skip`/`limit` are omitted because they are
non-functional; `forceServerObjectId` is not part of the declared library contract.

For `findOneAndUpdate`, `findOneAndReplace` and `findOneAndDelete`,
`includeResultMetadata: true` returns a wrapper whose `value` is the selected
document or `null`. Without that option, the document or `null` is returned
directly. `distinct` returns a values array normally and a plan document when an
explain option is supplied; for driver-backed operations, even `explain: false`
requests `queryPlanner` rather than disabling explain.
Comments must be strings. Update, delete and find-and-modify operations support
`queryPlanner`, not `executionStats`. Explain results remain
`Record<string, unknown>` because DocumentDB plans can differ from MongoDB plans.

Use `collection.aggregate(pipeline).explain()` for aggregation explanations.
Do not pass `{ explain: true }` to `aggregate()` and iterate the returned cursor:
iteration expects a cursor response, not an explanation document. Response
decoding is controlled by this library's EJSON handling, not directly by the
MongoDB driver's BSON options.

### Migrating from temporary declarations or import suppressions

After updating to the typed release, remove temporary application-local
declarations for `@adobe/aio-lib-db` so they do not mask the package contract.
Remove targeted import `@ts-expect-error` directives, including in setup scripts
imported by SDK-generated installation actions and in runtime actions. A
previously necessary directive now reports **TS2578: Unused '@ts-expect-error'
directive**. Do not replace it with `@ts-ignore` or disable strict checking.
Run your application's strict compiler check and `aio app build` after removal.
Declarations improve compiler checking; they do not provision a database or prove
live database behavior.

### Declaration maintenance

The declarations are authored in `index.d.ts`; update them with public API
changes. `npm test` runs the existing mocked runtime tests and packed-package
consumer compiler tests, including negative usage cases. No database is contacted.
The compiler tests exercise the npm artifact, not a source-only declaration path.
Generating declarations from improved JSDoc is a possible future maintainer-led
alternative; the current JSDoc does not specify the complete type contract.

---

## Support

For issues, feature requests, or questions, please refer to the project's issue tracker or documentation.
