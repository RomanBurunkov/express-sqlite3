const { isFunc } = require('tm-is');
const session = require('express-session');
const Sqlite3Store = require('../lib/express-sqlite3')(session);
// Require tests utility functions.
const { mockSessions, insertMock } = require('./utils');

const mockSid = 'qwerty34566767';
const mockSess = { test: '123', cookie: {} };

const store = new Sqlite3Store({ db: ':memory:' });

beforeAll(() => insertMock(store.getStoreDb()));

describe('Test SQLite3Store class', () => {
  describe('Check required methods exsistance.', () => {
    const methods = [
      'get', 'set', 'destroy', 'length', 'clear', 'touch', 'all',
    ];

    methods.forEach((method) => {
      test(`Method ${method} should be defined`, () => expect(store[method]).toBeDefined());
      test(`Method ${method} should be a function`, () => expect(isFunc(store[method])).toBe(true));
    });
  });

  describe('Test all method', () => {
    test('Should return false if no callback given', () => {
      expect(store.all()).toBe(false);
    });

    test('Should return all sessions', (done) => {
      const sessions = mockSessions();
      store.all((err, sess) => {
        if (err) {
          done(err);
          return;
        }
        expect(sess.length).toBe(sessions.length);
        done();
      });
    });
  });

  describe('Test get method', () => {
    const sessions = mockSessions();

    test('Should return correct session data for not expired session', (done) => {
      const sid = sessions[sessions.length - 1][0];
      const sess = JSON.parse(sessions[sessions.length - 1][1]);
      store.get(sid, (err, res) => {
        if (err) {
          done(err);
          return;
        }
        expect(res).toEqual(sess);
        done();
      });
    });

    test('Should return undefined in case sid has not been specified', (done) => {
      store.get(undefined, (err, res) => {
        if (err) {
          done(err);
          return;
        }
        expect(res).toBeUndefined();
        done();
      });
    });

    test('Should return undefined for expired session', (done) => {
      const sid = sessions[0][0];
      store.get(sid, (err, res) => {
        if (err) {
          done(err);
          return;
        }
        expect(res).toBeUndefined();
        done();
      });
    });
  });

  describe('Test set method', () => {
    test('Should return error into callback if sid is not set', (done) => {
      store.set(undefined, undefined, (err) => {
        if (err) {
          done();
          return;
        }
        done(new Error('Should return error into callback if sid is not set'));
      });
    });

    test('Should return error into callback if session is not an object', (done) => {
      store.set('qwe343444', undefined, (err) => {
        if (err) {
          done();
          return;
        }
        done(new Error('Should return error into callback if session is not an object'));
      });
    });

    test('Should store new session', (done) => {
      store.set(mockSid, mockSess, (errSet) => {
        if (errSet) {
          done(errSet);
          return;
        }
        store.get(mockSid, (errGet, res) => {
          if (errGet) {
            done(errGet);
            return;
          }
          expect(res).toEqual(mockSess);
          done();
        });
      });
    });
  });

  describe('Test touch method', () => {
    test('Should return true to callback if session data is empty', (done) => {
      store.touch(mockSid, {}, (err, res) => {
        if (err) {
          done(err);
          return;
        }
        expect(res).toBeTruthy();
        done();
      });
    });

    test('Should return true to callback and session should become expired', (done) => {
      store.touch(mockSid, { cookie: { expires: 10000 } }, (err, res) => {
        if (err) {
          done(err);
          return;
        }
        expect(res).toBeTruthy();
        store.get(mockSid, (getErr, getRes) => {
          if (getErr) {
            done(getErr);
            return;
          }
          expect(getRes).toBeUndefined();
          done();
        });
      });
    });
  });

  describe('Test destroy method', () => {
    test('Should delete session with a given sid', (done) => {
      store.destroy(mockSid, (err) => {
        if (err) {
          done(err);
          return;
        }
        store.get(mockSid, (getErr, res) => {
          if (getErr) {
            done(getErr);
            return;
          }
          expect(res).toBeUndefined();
          done();
        });
      });
    });
  });

  describe('Test length method', () => {
    test('Should not return an error in test case', (done) => {
      store.length(done);
    });

    test('Should return expected amount of sessions', (done) => {
      store.length((err, res) => {
        if (err) {
          done(err);
          return;
        }
        expect(res).toBe(mockSessions().length);
        done();
      });
    });
  });

  describe('Test clear method', () => {
    test('Should delete all sessions', (done) => {
      store.clear((err) => {
        if (err) {
          done(err);
          return;
        }
        store.length((lenErr, res) => {
          if (lenErr) {
            done(lenErr);
            return;
          }
          expect(res).toBe(0);
          done();
        });
      });
    });
  });
});
