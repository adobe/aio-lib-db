# aio-lib-abdb

**aio-lib-abdb** is a lightweight document database library for Adobe I/O Runtime apps. It provides structured, queryable, and flexible data persistence beyond simple file or key-value storage.

---

## Installation

Currently, `aio-lib-abdb` is used locally. Install it by adding it to your `package.json` file:

```json
{
  "dependencies": {
    "@adobe/aio-lib-abdb": "file:../path/to/aio-lib-abdb"
  }
}
```

> **Note:** In future, the library will be available on npm for easier installation.

---

## Usage

First, require and initialize the library:

```javascript
const abdb = require('aio-lib-abdb');

async function main() {
  const db = await abdb.init({ tenantId: '<your-tenant-id>' });
  const client = await db.connect();

  const stats = await client.dbStats();
  console.log(stats);

  await client.close();
}

main();
```

---

## API Overview

- `init(options)`: Initializes the client with tenant ID.
- `connect()`: Connects to the database and returns a client.
- `dbStats()`: Returns database statistics (requires connection).
- `close()`: Closes the database connection.

---

## Why Use aio-lib-abdb?

- Structured document storage (JSON-based)
- Powerful querying capabilities
- Fine-grained updates without rewriting entire blobs
- Native integration into Adobe I/O Runtime serverless apps
