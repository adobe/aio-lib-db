# aio-lib-abdb

**aio-lib-abdb** is a lightweight document database library for Adobe I/O Runtime apps. It provides structured, queryable, and flexible data persistence beyond simple file or key-value storage.

---

## Installation

Currently, `aio-lib-abdb` is used locally. Install it by providing the local path to the package:

```bash
npm install /path/to/aio-lib-abdb
```

Or add it directly to your `package.json`:

```json
{
  "dependencies": {
    "aio-lib-abdb": "file:../path/to/aio-lib-abdb"
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
  const client = await abdb.init();
}

main();
```

---

## API Overview

- `init(options)`: Initialize the client with abdb tenant id

---

## Why Use aio-lib-abdb?

- Structured document storage (JSON-based)
- Powerful querying capabilities
- Fine-grained updates without rewriting entire blobs
- Native integration into Adobe I/O Runtime serverless apps





