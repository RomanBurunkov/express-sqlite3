# Changelog

## 0.1.0

### Breaking changes

- `sqlite3` is no longer installed with this package. It is now a peer dependency (`^5.1.7 || ^6.0.0`), so the host application must install the `sqlite3` version it needs:

  ```
  npm install sqlite3
  ```

- Minimum supported Node.js version is now `20.17.0` (see `engines`). Node.js 12–18 are no longer supported.

### Changed

- CI: updated `actions/checkout` to v4, `actions/setup-node` to v4 and `codecov/codecov-action` to v5.
- CI: test matrix is now Node.js 20, 22, 24 and 26.
- `sqlite3` `^6.0.1` is kept in `devDependencies` for tests.

## 0.0.5

- Previous release.
