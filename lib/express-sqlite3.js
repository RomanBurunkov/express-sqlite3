const { isFunc, isEmpty, isObject } = require('tm-is');
const StoreDb = require('./storedb');
const {
  buildOptions, extractSessExpires, extractSessMaxAge, processCallback,
} = require('./utils');

const DEFAULT_OPTS = {
  maxAge: 86400000, // One day in milliseconds.
};

const DB = Symbol('Store DB');

/**
 *
 * @param {Object} session Express session.
 * @returns {Object} SQLite3Store class.
 */
module.exports = ({ Store }) => class SQLite3Store extends Store {
  /**
   * @param {Object} opts Session store options.
   */
  constructor(opts = {}) {
    super(opts);
    const options = buildOptions(DEFAULT_OPTS, opts);
    this.maxAge = parseInt(options.maxAge, 10);
    this[DB] = new StoreDb(options);
  }

  getStoreDb() {
    return this[DB];
  }

  /**
   * Gets all sessions in the store as an array.
   * @param {Function} cb
   */
  all(cb) {
    if (!isFunc(cb)) return false;
    const query = `SELECT sess FROM ${this[DB].table}`;
    return this[DB].client.all(query, (e, rows) => {
      processCallback(e, rows, cb, (res) => res
        .filter((r) => r.sess)
        .map((r) => JSON.parse(r.sess)));
    });
  }

  /**
   * Fetches session by the given sid.
   * @param {string} sid
   * @param {Function} cb
   */
  get(sid, cb) {
    if (isEmpty(sid)) return cb(null);
    const data = [sid, Date.now()];
    const query = `SELECT sess FROM ${this[DB].table} WHERE sid = ? AND ? <= expired`;
    return this[DB].client.get(query, data, (e, row) => processCallback(e, row, cb, (r) => (r
      ? JSON.parse(r.sess)
      : undefined
    )));
  }

  /**
   * Commits the given `sess` object associated with the given `sid`.
   * @param {string} sid
   * @param {Object} sess
   * @param {Function} cb
   */
  set(sid, sess, cb) {
    try {
      if (isEmpty(sid) || !isObject(sess)) {
        throw new Error('Session id or session data has not been set!');
      }
      const maxAge = extractSessMaxAge(sess, this.maxAge);
      const query = `INSERT OR REPLACE INTO ${this[DB].table} VALUES (?, ?, ?)`;
      this[DB].client.all(query, [sid, JSON.stringify(sess), Date.now() + maxAge], cb);
    } catch (e) {
      if (isFunc(cb)) cb(e);
    }
  }

  /**
   * Destroys the session associated with the given `sid`.
   * @param {string} sid
   * @param {Function} cb
   */
  destroy(sid, cb) {
    this[DB].client.run(`DELETE FROM ${this[DB].table} WHERE sid = ?`, [sid], cb);
  }

  /**
   * Fetch number of sessions.
   * @param {Function} cb
   */
  length(cb) { this[DB].count(cb); }

  /**
   * Clear all sessions.
   * @param {Function} cb
   */
  clear(cb) { this[DB].clear(cb); }

  /**
   * Touch the given session object associated with the given sid.
   * @param {string} sid
   * @param {Object} sess
   * @param {Function} cb
   */
  touch(sid, sess, cb) {
    const expires = extractSessExpires(sess);
    if (expires === -1) {
      if (isFunc(cb)) cb(null, true);
      return;
    }
    const query = `UPDATE ${this[DB].table} SET expired=? WHERE sid = ? AND ? <= expired`;
    const data = [expires, sid, Date.now()];
    this[DB].client.run(query, data, (err) => processCallback(err, true, cb));
  }
};
