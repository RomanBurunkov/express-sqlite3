const { isObj, isFunc, isValidDate } = require('tm-is');

/**
 * Processes very basic callback logic.
 * @param {Object} err Error object or null.
 * @param {*} res Result data.
 * @param {Function} cb Callback.
 * @param {Function} action Function to process result.
 */
exports.processCallback = (err, res, cb, action) => {
  if (!isFunc(cb)) {
    if (err) throw err;
    return isFunc(action) ? action(res) : res;
  }
  return err ? cb(err) : cb(null, isFunc(action) ? action(res) : res);
};

/**
 * Takes passed in args objects and merges them into one.
 * Argumets order matter. Arg with greater index overrides existed properties.
 * @param  {...Object} args Given objects. Use first arg as a default.
 * @returns {Object} result options.
 */
exports.buildOptions = (...args) => args
  .filter((a) => isObj(a))
  .reduce((res, opts) => ({ ...res, ...opts }), {});

/**
 * Extracts cookie expires value from the given session.
 * @param {Object} s Session object.
 * @returns {number} Session expires timestamp. -1 if session data isn't invalid.
 */
exports.extractSessExpires = (s) => (isObj(s) && isObj(s.cookie) && isValidDate(s.cookie.expires)
  ? new Date(s.cookie.expires).getTime()
  : -1
);

/**
 * Extract session max age from session cookie.
 * @param {Object} s Session object.
 * @param {number} defMaxAge Default max age value.
 * @returns {number} Max age for session.
 */
exports.extractSessMaxAge = (s, defMaxAge) => {
  if (!isObj(s) || !isObj(s.cookie)) {
    return defMaxAge;
  }
  const maxAge = parseInt(s.cookie.maxAge, 10);
  return Number.isNaN(maxAge) || !maxAge ? defMaxAge : maxAge;
};
