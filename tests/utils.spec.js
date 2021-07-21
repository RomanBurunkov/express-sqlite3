const { isObject } = require('tm-is');
const utils = require('../lib/utils');

describe('Test utils functions', () => {
  describe('Test buildOptions function', () => {
    test('Should return an empty object if nothing passed', () => {
      const res = utils.buildOptions();
      expect(isObject(res) && Object.keys(res).length === 0).toBeTruthy();
    });

    test('Should ignore non object args', () => {
      const o1 = { a: 1, b: 2 };
      const res = utils.buildOptions(1, 'srr', o1);
      expect(res).toEqual({ a: 1, b: 2 });
    });

    test('Should override values with higher priority for args with higher indexes', () => {
      const o1 = { a: 1, b: 2 };
      const o2 = { b: 5 };
      const res = utils.buildOptions(o1, o2);
      expect(res).toEqual({ a: 1, b: 5 });
    });
  });

  describe('Test extractSessExpires function', () => {
    test('Should return flase if no session passed', () => {
      expect(utils.extractSessExpires()).toBe(false);
    });

    test('Should return flase if given session is not an object', () => {
      expect(utils.extractSessExpires('sess')).toBe(false);
    });

    test('Should return flase if given session have no cookie element', () => {
      expect(utils.extractSessExpires({})).toBe(false);
    });

    test('Should return flase if given session.cookie is not an object', () => {
      expect(utils.extractSessExpires({ cookie: 'cookie' })).toBe(false);
    });

    test('Should return flase if given session.cookie is empty', () => {
      expect(utils.extractSessExpires({ cookie: {} })).toBe(false);
    });

    test('Should return cookie expires value in case of valid session data', () => {
      expect(utils.extractSessExpires({ cookie: { expires: 10000 } })).toBe(10000);
    });
  });

  describe('Test extractSessMaxAge function', () => {
    test('Should return def max age if no session passed', () => {
      expect(utils.extractSessMaxAge(undefined, 100)).toBe(100);
    });

    test('Should return max age from the session cookie if session data valid', () => {
      expect(utils.extractSessMaxAge({ cookie: { maxAge: 100 } }, 200)).toBe(100);
    });
  });
});
