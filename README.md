# aio-lib-db

**aio-lib-db** is a powerful document database library for Adobe I/O Runtime applications. It provides structured, queryable, and flexible data persistence with MongoDB-like query capabilities.

---

## Installation

Currently, `aio-lib-db` is used locally. Install it by adding it to your `package.json` file:

```json
{
  "dependencies": {
    "@adobe/aio-lib-db": "file:../path/to/aio-lib-db"
  }
}
```

> **Note:** In the future, the library will be available on npm for easier installation.

---

## Quick Start

### Setup

First, set your credentials in your `.env` file:

```env
AIO_runtime_namespace=your_namespace
AIO_runtime_auth=user:password
```

> To find runtime namespace and credentials, click "Download all" in the Adobe Developer Console for your project workspace and the values will be under `project.workspace.details.runtime.namespaces`.

### Basic Usage

```javascript
const libDb = require('@adobe/aio-lib-db');

async function main() {
  try {
    // Initialize and connect
    const db = await libDb.init();
    const client = await db.connect();

    // Get a collection
    const users = client.collection('users');

    // Insert a document
    await users.insertOne({ name: 'John Doe', email: 'john@example.com' });

    // Find documents
    const cursor = users.find({ name: 'John Doe' });
    const results = await cursor.toArray();
  }
  finally {
    // Close any open cursors when the application is done
    await client.close();
  }
}
```

---

## Collection Operations

### Insert Operations

```javascript
// Insert a single document
const result = await collection.insertOne({
  name: 'Jane Smith',
  email: 'jane@example.com',
  age: 30
});

// Insert multiple documents
const result = await collection.insertMany([
  { name: 'Alice', email: 'alice@example.com' },
  { name: 'Bob', email: 'bob@example.com' }
]);
```

### Find Operations

```javascript
// Find one document
const user = await collection.findOne({ email: 'john@example.com' });

// Find all documents matching a filter
const cursor = collection.find({ age: { $gte: 18 } });
const adults = await cursor.toArray();

// Find with projection and sorting
const cursor = collection.find({ age: { $gte: 18 } })
  .project({ name: 1, email: 1 })
  .sort({ name: 1 })
  .limit(10);
```

### Update Operations

```javascript
// Update one document
const result = await collection.updateOne(
  { email: 'john@example.com' },
  { $set: { age: 31 } }
);

// Update multiple documents
const result = await collection.updateMany(
  { age: { $lt: 18 } },
  { $set: { category: 'minor' } }
);

// Find and update
const updatedUser = await collection.findOneAndUpdate(
  { email: 'john@example.com' },
  { $set: { lastLogin: new Date() } },
  { returnDocument: 'after' }
);
```

### Delete Operations

```javascript
// Delete one document
const result = await collection.deleteOne({ email: 'john@example.com' });

// Delete multiple documents
const result = await collection.deleteMany({ age: { $lt: 0 } });

// Find and delete
const deletedUser = await collection.findOneAndDelete({ email: 'john@example.com' });
```

---

## Query Building with Cursors

> Cursors will close themselves after all results have been processed, but they can be closed early to release resources by calling `cursor.close()`, and best practice is to close them explicitly once they're no longer needed. The `client.close()` method will close all open cursors and connections, so it should be called when the application is shutting down or no longer needs database access.

### FindCursor Methods

The `find()` method returns a `FindCursor` that supports method chaining:

```javascript
const cursor = collection.find({ status: 'active' })
  .filter({ category: 'premium' })          // Additional filtering
  .sort({ createdAt: -1 })                  // Sort by creation date (newest first)
  .project({ name: 1, email: 1, _id: 0 })  // Only include name and email
  .limit(20)                                // Limit to 20 results
  .skip(10)                                 // Skip first 10 results
  .batchSize(5);                            // Process in batches of 5
```

### Cursor Iteration

```javascript
// Using toArray() - loads all results into memory
const results = await cursor.toArray();

// Using iteration - memory efficient
while (await cursor.hasNext()) {
  const doc = await cursor.next();
  console.log(doc);
}

// Using for await...of - most convenient
for await (const doc of cursor) {
  console.log(doc);
}

// Using streams
const stream = cursor.stream();
stream.on('data', (doc) => {
  console.log(doc);
});

// Check cursor properties
console.log('Cursor ID:', cursor.id);
console.log('Is closed:', cursor.closed);
```

### Cursor Transformations

```javascript
// Transform documents as they're retrieved
const cursor = collection.find({ status: 'active' })
  .map(doc => ({
    ...doc,
    displayName: `${doc.firstName} ${doc.lastName}`,
    isVip: doc.tier === 'premium'
  }));

// Chain multiple transformations
const cursor = collection.find({ status: 'active' })
  .map(doc => ({ ...doc, processed: true }))
  .map(doc => ({ ...doc, timestamp: new Date() }));
```

---

## Aggregation Pipeline

### Basic Aggregation

```javascript
// Simple aggregation
const pipeline = [
  { $match: { status: 'active' } },
  { $group: { _id: '$category', count: { $sum: 1 } } },
  { $sort: { count: -1 } }
];

const cursor = collection.aggregate(pipeline);
const results = await cursor.toArray();
```

### Chained Aggregation Building

```javascript
// Build aggregation pipeline using method chaining
const cursor = collection.aggregate()
  .match({ status: 'active' })
  .group({ _id: '$category', total: { $sum: '$amount' } })
  .sort({ total: -1 })
  .limit(10)
  .project({ category: '$_id', total: 1, _id: 0 });

const topCategories = await cursor.toArray();

// Geospatial aggregation example
const nearbyStores = await collection.aggregate()
  .geoNear({
    near: { type: 'Point', coordinates: [-122.4194, 37.7749] }, // San Francisco
    distanceField: 'distance',
    maxDistance: 1000, // 1km radius
    spherical: true
  })
  .match({ status: 'open' })
  .limit(10)
  .toArray();
```

### Advanced Aggregation

```javascript
// Complex aggregation with multiple stages
const cursor = collection.aggregate()
  .match({ dateCreated: { $gte: new Date('2024-01-01') } })
  .lookup({
    from: 'categories',
    localField: 'categoryId',
    foreignField: '_id',
    as: 'category'
  })
  .unwind('$category')
  .redact({
    $cond: {
      if: { $eq: ['$category.status', 'active'] },
      then: '$$DESCEND',
      else: '$$PRUNE'
    }
  })
  .group({
    _id: '$category.name',
    totalSales: { $sum: '$amount' },
    averageOrder: { $avg: '$amount' },
    orderCount: { $sum: 1 }
  })
  .sort({ totalSales: -1 })
  .limit(5)
  .out('sales_summary'); // Output results to a new collection
```

---

## Advanced Features

### Indexing

```javascript
// Create indexes for better query performance
await collection.createIndex({ email: 1 }, { unique: true });
await collection.createIndex({ 'profile.age': 1, status: 1 });

// List all indexes
const indexes = await collection.getIndexes();

// Drop an index
await collection.dropIndex('email_1');
```

### Counting Documents

```javascript
// Fast count estimate (uses collection metadata)
const estimate = await collection.estimatedDocumentCount();

// Accurate count with filter (scans documents)
const activeUsers = await collection.countDocuments({ status: 'active' });

// Count all documents accurately
const totalExact = await collection.countDocuments({});
```

### Bulk Operations

```javascript
// Perform multiple operations in a single request
const operations = [
  { insertOne: { document: { name: 'Alice' } } },
  { updateOne: { filter: { name: 'Bob' }, update: { $set: { age: 30 } } } },
  { deleteOne: { filter: { name: 'Charlie' } } }
];

const result = await collection.bulkWrite(operations);
```

### Collection Management

```javascript
// Drop a collection (permanently delete)
await collection.drop();

// Rename a collection
await collection.renameCollection('new_collection_name');

// Create a new collection with options
const newCollection = await client.createCollection('analytics', {
  validator: {
    $jsonSchema: {
      required: ['userId', 'action', 'timestamp'],
      properties: {
        userId: { type: 'string' },
        action: { type: 'string' },
        timestamp: { type: 'date' }
      }
    }
  }
});
```

### Query Options

```javascript
// Advanced query options
const cursor = collection.find({ status: 'active' })
  .hint({ status: 1 })                    // Use specific index
  .maxTimeMS(5000)                        // Set query timeout
  .readConcern({ level: 'majority' })     // Set read concern
  .collation({ locale: 'en', strength: 2 }) // Case-insensitive sorting
  .noCursorTimeout(true);                 // Disable cursor timeout
```

---

## Error Handling

```javascript
const { DbError } = require('@adobe/aio-lib-db');

try {
  await collection.insertOne({ email: 'invalid-email' });
} catch (error) {
  if (error instanceof DbError) {
    console.error('Database error:', error.message);
  } else {
    console.error('Unexpected error:', error);
  }
}
```

---

## Best Practices

### 1. **Always Close Connections**

```javascript
const client = await db.connect();
try {
  // Your database operations
} finally {
  await client.close();
}
```

### 2. **Use Projections for Large Documents**

```javascript
// Only fetch needed fields
const users = await collection.find({})
  .project({ name: 1, email: 1, _id: 0 })
  .toArray();
```

### 3. **Use Indexes for Frequent Queries**

```javascript
// Create indexes for frequently queried fields
await collection.createIndex({ email: 1 });
await collection.createIndex({ status: 1, createdAt: -1 });
```

### 4. **Handle Large Result Sets with Cursors**

```javascript
// For large datasets, use cursor iteration instead of toArray()
for await (const doc of collection.find({})) {
  // Process one document at a time
  await processDocument(doc);
}
```

### 5. **Use Aggregation for Complex Queries**

```javascript
// Use aggregation for complex data processing
const report = await collection.aggregate()
  .match({ date: { $gte: startDate } })
  .group({ _id: '$category', total: { $sum: '$amount' } })
  .sort({ total: -1 })
  .toArray();
```

---

## API Reference

### DbClient

- `dbStats()` - Get database statistics
- `listCollections(filter?, options?)` - List collections
- `collection(name)` - Get collection instance
- `createCollection(name, options?)` - Create new collection
- `close()` - Close the connection and all open cursors

### DbCollection

**Insert Operations:**
- `insertOne(document, options?)` - Insert single document
- `insertMany(documents, options?)` - Insert multiple documents

**Find Operations:**
- `findOne(filter, options?)` - Find single document
- `find(filter?, options?)` - Find multiple documents (returns FindCursor)
- `findArray(filter?, options?)` - Find single batch as array

**Update Operations:**
- `updateOne(filter, update, options?)` - Update single document
- `updateMany(filter, update, options?)` - Update multiple documents
- `findOneAndUpdate(filter, update, options?)` - Find and update
- `replaceOne(filter, replacement, options?)` - Replace document

**Delete Operations:**
- `deleteOne(filter, options?)` - Delete single document
- `deleteMany(filter, options?)` - Delete multiple documents
- `findOneAndDelete(filter, options?)` - Find and delete

**Aggregation:**
- `aggregate(pipeline?, options?)` - Run aggregation (returns AggregateCursor)

**Utility Operations:**
- `countDocuments(filter?, options?)` - Count documents
- `estimatedDocumentCount(options?)` - Estimate document count from metadata
- `distinct(field, filter?, options?)` - Get distinct values
- `bulkWrite(operations, options?)` - Bulk operations

**Statistics & Monitoring:**
- `stats(options?)` - Get collection statistics

**Index Operations:**
- `createIndex(specification, options?)` - Create index
- `getIndexes()` - List indexes
- `dropIndex(indexName, options?)` - Drop index

**Collection Management:**
- `drop(options?)` - Drop the collection
- `renameCollection(newName, options?)` - Rename collection

### FindCursor

**Query Building:**
- `filter(filter)` - Set query filter
- `sort(sort, direction?)` - Set sort order
- `project(projection)` - Set field projection
- `limit(limit)` - Set result limit
- `skip(skip)` - Set number to skip
- `batchSize(size)` - Set batch size

**Iteration:**
- `hasNext()` - Check if more results available
- `next()` - Get next document
- `toArray()` - Get all results as array

**Properties:**
- `id` - Get cursor ID
- `closed` - Check if cursor is closed and exhausted

**Utilities:**
- `map(transform)` - Transform documents
- `stream(transform?)` - Get readable stream
- `close()` - Close the cursor and release resources

### AggregateCursor

**Pipeline Building:**
- `match(filter)` - Add $match stage
- `group(groupSpec)` - Add $group stage
- `sort(sort)` - Add $sort stage
- `project(projection)` - Add $project stage
- `limit(limit)` - Add $limit stage
- `skip(skip)` - Add $skip stage
- `lookup(lookupSpec)` - Add $lookup stage
- `unwind(path)` - Add $unwind stage
- `out(outSpec)` - Add $out stage (output to collection)
- `redact(redactSpec)` - Add $redact stage (conditional filtering)
- `geoNear(geoNearSpec)` - Add $geoNear stage (geospatial queries)
- `addStage(stage)` - Add custom stage

**Iteration:** (Same as FindCursor)
- `hasNext()`, `next()`, `toArray()`, `stream()`, etc.

**Properties:**
- `id` - Get cursor ID
- `closed` - Check if cursor is closed and exhausted

**Utilities:**
- `close()` - Close the cursor and release resources

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

## Support

For issues, feature requests, or questions, please refer to the project's issue tracker or documentation.
