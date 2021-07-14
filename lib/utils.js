const { isObject } = require('tm-is');

exports.buildOptions = (...args) => args
  .filter((a) => isObject(a))
  .reduce((res, opts) => ({ ...res, ...opts }), {});

exports.extractSessExpires = (s) => (isObject(s) && isObject(s.cookie) && s.cookie.expires
  ? new Date(s.cookie.expires).getTime()
  : false);
