# aio-lib-db

**aio-lib-db** is a lightweight document database library for Adobe I/O Runtime apps. It provides structured, queryable, and flexible data persistence beyond simple file or key-value storage.

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

## Usage

First, set `AIO_runtime_namespace` and `AIO_runtime_auth` in your `.env` file.

> `AIO_runtime_auth` must be in `<user>:<pass>` format.
> 
> To find runtime namespace and credentials, click "Download all" in the Adobe Developer Console for your project workspace and the values will be under `project.workspace.details.runtime.namespaces`.

Next, import and initialize the library:

```javascript
const libDb = require('aio-lib-db');

async function main() {
  const db = await libDb.init();
  const client = await db.connect();

  const stats = await client.dbStats();
  console.log(stats);

  await client.close();
}

main();
```

---

## API Overview

- `init(runtimeNamespace?, runtimeAuth?)`: Initializes the client for the provided `runtimeNamespace` and `runtimeAuth`.  `AIO_runtime_namespace` and `AIO_runtime_auth` can be provided through environment variables instead.
- `connect()`: Connects to the database and returns a client.
- `dbStats()`: Returns database statistics (requires connection).
- `close()`: Closes the database connection.

---

## Why Use aio-lib-db?

- Structured document storage (JSON-based)
- Powerful querying capabilities
- Fine-grained updates without rewriting entire blobs
- Native integration into Adobe I/O Runtime serverless apps
