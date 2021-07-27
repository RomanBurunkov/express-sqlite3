# express-sqlite3

[![npm](https://img.shields.io/npm/v/express-sqlite3.svg)](https://www.npmjs.org/package/express-sqlite3)
[![codecov](https://codecov.io/gh/RomanBurunkov/express-sqlite3/branch/main/graph/badge.svg?token=AM4PVNJJGK)](https://codecov.io/gh/RomanBurunkov/express-sqlite3)

SQLite3 session store for the [express-session](https://www.npmjs.com/package/express-session) package.

### Installation

`npm i express-sqlite3`

### Options

| name   | description | default value|
| ------ | ----------- |:--------:|
| db | Database file name | sessions |
| dir | Database file directory | ./ |
| mode | SQLite3 client [mode option](https://github.com/mapbox/node-sqlite3/wiki/API#new-sqlite3databasefilename-mode-callback) |  |
| table | Database table name | sessions |
| maxAge | Sessions maximum age in msecs| 86400000 (One day) |
| concurentDb | Enables [WAL](https://www.sqlite.org/wal.html) mode | false |
| cleanupInterval | Interval for expired sessions cleanup in msecs | 3600000 (One hour)|

### Example

For Express 4.xx

```js
const express = require('express');
const session = require('express-session');
const Store = require('express-sqlite3')(session);

const app = express();

const storeOptions = {
  db: ':memory:', // Use SQLite3 in memory db.
  concurentDb: true, // Enable SQLite3 WAL.
};

app.use(session({
  store: new Store(storeOptions),
  secret: 'qwerty',
  resave: false,
  saveUninitialized: true,
}));
```

### Test

Install dev dependencies.

`npm i -D express-sqlite3`

Then run

`npm test` or `npm run test:coverage`
