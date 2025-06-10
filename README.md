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

> **Note:** In the future, the library will be available on npm for easier installation.

---

## Usage

First, set `RUNTIME_NAMESPACE` and `RUNTIME_AUTH` in your `.env` file.

> `RUNTIME_AUTH` must be in `<user>:<pass>` format.
> 
> To find runtime namespace and credentials, click "Download all" in the Adobe Developer Console for your project workspace and the values will be under `project.workspace.details.runtime.namespaces`.

Next, import and initialize the library:

```javascript
const abdb = require('aio-lib-abdb');

async function main() {
  const db = await abdb.init();
  const client = await db.connect();

  const stats = await client.dbStats();
  console.log(stats);

  await client.close();
}

main();
```

---

## API Overview

- `init(runtimeNamespace?, runtimeAuth?)`: Initializes the client for the provided `runtimeNamespace` and `runtimeAuth`.  `RUNTIME_NAMESPACE` and `RUNTIME_AUTH` can be provided through environment variables instead.
- `connect()`: Connects to the database and returns a client.
- `dbStats()`: Returns database statistics (requires connection).
- `close()`: Closes the database connection.

---

## Why Use aio-lib-abdb?

- Structured document storage (JSON-based)
- Powerful querying capabilities
- Fine-grained updates without rewriting entire blobs
- Native integration into Adobe I/O Runtime serverless apps
