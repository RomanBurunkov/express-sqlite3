const { join } = require('path');
const sqlite3 = require('sqlite3');

/**
 * @type {Integer}  One day in milliseconds.
 */
const ONE_DAY = 86400000;

/**
 * Remove expired sessions from the db.
 * @param {Object} store
 */
function dbCleanup(store) {
  store.db.run(`DELETE FROM ${store.table} WHERE ? > expired`, [new Date().getTime()]);
}

const createQuery = (tbl) => `CREATE TABLE IF NOT EXISTS ${tbl} (sid PRIMARY KEY, expired, sess)`;

module.exports = (session) => {
  const { Store } = session;

  return class SQLite3Store extends Store {
    constructor(options = {}) {
      super(options);
      this.table = options.table || 'sessions';
      this.db = options.db || this.table;

      const dbPath = this.db.indexOf(':memory:') > -1 || this.db.indexOf('?mode=memory') > -1
        ? this.db
        : join(options.dir || '.', this.db);

      this.db = new sqlite3.Database(dbPath, options.mode);

      const pragma = options.concurrentDb ? 'PRAGMA journal_mode = wal; ' : '';
      this.db.exec(`${pragma}${createQuery(this.table)}`, (err) => {
        if (err) throw err;
        dbCleanup(this);
        setInterval(dbCleanup, ONE_DAY, this).unref();
      });
    }

    /**
     * Fetches session by the given sid.
     * @param {string} sid
     * @param {Function} cb
     */
    get(sid, cb) {
      const now = new Date().getTime();
      const query = `SELECT sess FROM ${this.table} WHERE sid = ? AND ? <= expired`;
      this.db.get(query, [sid, now], (err, row) => (err
        ? cb(err)
        : cb(null, row ? JSON.parse(row.sess) : undefined)
      ));
    }

    /**
     * Commits the given `sess` object associated with the given `sid`.
     * @param {string} sid
     * @param {Object} sess
     * @param {Function} cb
     */
    set(sid, sess, cb) {
      try {
        const expired = new Date().getTime() + (sess.cookie.maxAge || ONE_DAY);
        const query = `INSERT OR REPLACE INTO ${this.table} VALUES (?, ?, ?)`;
        this.db.all(query, [sid, expired, JSON.stringify(sess)], (...args) => {
          if (cb) cb(...args);
        });
      } catch (e) {
        if (cb) cb(e);
      }
    }

    /**
     * Destroys the session associated with the given `sid`.
     * @param {string} sid
     * @param {Function} cb
     */
    destroy(sid, cb) {
      this.db.run(`DELETE FROM ${this.table} WHERE sid = ?`, [sid], cb);
    }

    /**
     * Fetch number of sessions.
     * @param {Function} cb
     */
    length(cb) {
      this.db.all(`SELECT COUNT(*) AS count FROM ${this.table}`, (err, rows) => (err
        ? cb(err)
        : cb(null, rows[0].count)
      ));
    }

    /**
     * Clear all sessions.
     * @param {Function} cb
     */
    clear(cb) {
      this.db.exec(`DELETE FROM ${this.table}`, (err) => (err
        ? cb(err)
        : cb(null, true)
      ));
    }

    /**
     * Touch the given session object associated with the given sid.
     * @param {string} sid
     * @param {Object} sess
     * @param {Function} cb
     */
    touch(sid, sess, cb) {
      if (!sess || !session.cookie || !session.cookie.expires) {
        return cb(null, true);
      }
      const now = new Date().getTime();
      const cookieExpires = new Date(session.cookie.expires).getTime();
      const query = `UPDATE ${this.table} SET expired=? WHERE sid = ? AND ? <= expired`;
      return this.db.run(query, [cookieExpires, sid, now], (err) => {
        if (!cb) return;
        cb(err || null, !err);
      });
    }
  };
};
