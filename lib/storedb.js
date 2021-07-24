const { join } = require('path');
const sqlite3 = require('sqlite3');
const { isFunc } = require('tm-is');
const { buildOptions, processCallback } = require('./utils');

const DEFAULT_OPTS = {
  db: 'sessions',
  dir: '.',
  table: 'sessions',
  cleanupInterval: 3600000,
};

const OPTS = ['db', 'dir', 'mode', 'table', 'concurentDb'];

module.exports = class StoreDb {
  /**
   * StoreDb - Sessions storage data base.
   * @constructor
   * @param {Object} options DB storage options.
   * @param {string} option.db Database name.
   * @param {string} option.dir Path to the database file.
   * @param {number} options.mode Database client mode: OPEN_READONLY, OPEN_READWRITE, OPEN_CREATE.
   * @param {string} option.table Database table name to store sessions.
   * @param {boolean} options.concurentDb Use SQLite3 Write-Ahead Log if option set to true.
   * @param {number} option.cleanupInterval Interval in msec for cleanup routine.
   */
  constructor(options = {}) {
    // Build options.
    const opts = buildOptions(DEFAULT_OPTS, options);
    OPTS.forEach((key) => { this[key] = opts[key]; });
    this.cleanupInterval = parseInt(opts.cleanupInterval, 10);
    // Init database.
    this.client = new sqlite3.Database(this.path(), this.mode);
    this.client.once('open', () => {
      this.create();
      setInterval(() => this.cleanup(), this.cleanupInterval).unref();
    });
  }

  /**
   * Returns full path to the database file.
   * Valid values are filenames, ":memory:" for an anonymous in-memory db
   * and an empty string for an anonymous disk-based database.
   * @returns {string}
   */
  path(db = this.db) {
    return db.includes(':memory:') || db.includes('?mode=memory')
      ? db
      : join(this.dir, db);
  }

  /**
   * @returns {string} DB schema.
   */
  schema() {
    return `CREATE TABLE IF NOT EXISTS ${this.table} (
      sid TEXT PRIMARY KEY,
      sess TEXT NOT NULL,
      expired INT NOT NULL
    )`;
  }

  /**
   * Creates a table for sessions if it is not exist.
   * @param {Function} cb
   */
  create(cb) {
    const query = this.concurrentDb ? `PRAGMA journal_mode = wal;${this.schema()}` : this.schema();
    this.client.run(query, (err) => processCallback(err, null, cb));
  }

  /**
   * Removes expired sessions from the db.
   * @param {Function} cb
   */
  cleanup(cb) {
    const query = `DELETE FROM ${this.table} WHERE ? > expired`;
    this.client.run(query, Date.now(), (err) => processCallback(err, true, cb));
  }

  /**
   * Removes all sessions.
   * @param {Function} cb
   */
  clear(cb) {
    this.client.run(`DELETE FROM ${this.table}`, (err) => processCallback(err, true, cb));
  }

  /**
   * Count sessions stored in the db.
   * @param {Function} cb
   */
  count(cb) {
    if (!isFunc(cb)) return;
    const query = `SELECT COUNT(*) AS count FROM ${this.table}`;
    this.client.get(query, (e, row) => processCallback(e, row, cb, (r) => r.count));
  }
};
