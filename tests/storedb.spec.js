const { join } = require('path');
const { isFunc, isEmpty } = require('tm-is');
const StoreDb = require('../lib/storedb');
// Require tests utility functions.
const { mockSessions, insertMock } = require('./utils');

const storeDb = new StoreDb({ db: ':memory:' });

beforeAll(() => insertMock(storeDb));

describe('Test StoreDb class', () => {
  describe('Check required methods exsistance.', () => {
    const methods = [
      'path', 'schema', 'create', 'cleanup', 'clear', 'count',
    ];
    methods.forEach((method) => {
      test(`Method ${method} should be defined`, () => expect(storeDb[method]).toBeDefined());
      test(`Method ${method} should be a function`, () => expect(isFunc(storeDb[method])).toBe(true));
    });
  });

  describe('Test path method', () => {
    [':memory:', '?mode=memory'].forEach((db) => {
      test(`Should not change a given value if '${db}' passed`, () => {
        expect(storeDb.path(db)).toBe(db);
      });
    });

    test('Otherwise should use a dir option to build path to the database', () => {
      expect(storeDb.path('test')).toBe(join(storeDb.dir, 'test'));
    });
  });

  describe('Test schema method', () => {
    const res = storeDb.schema();

    test('Should return not empty string', () => {
      expect(!isEmpty(res) && typeof res === 'string').toBeTruthy();
    });

    test('Should contain table name', () => {
      expect(res.includes(storeDb.table)).toBeTruthy();
    });
  });

  describe('Test count method', () => {
    test('count method should return total amount of sessions stored in DB', (done) => {
      storeDb.count((err, count) => {
        if (err) return done(err);
        expect(count).toBe(mockSessions().length);
        return done();
      });
    });
  });

  describe('Test cleanup method', () => {
    test('cleanup should run without errors', (done) => {
      storeDb.cleanup((err) => done(err));
    });

    test('Should have only one session in the db after cleanup', (done) => {
      storeDb.count((err, count) => {
        if (err) return done(err);
        expect(count).toBe(1);
        return done();
      });
    });
  });

  describe('Test cleanup routine', () => {
    const storeDbCleanUp = new StoreDb({
      db: ':memory:',
      cleanupInterval: 2000,
    });
    beforeAll(() => insertMock(storeDbCleanUp));

    test('There should be only one session after cleanup interval', (done) => {
      setTimeout(() => {
        storeDbCleanUp.count((err, count) => {
          if (err) return done(err);
          expect(count).toBe(1);
          return done();
        });
      }, 3000);
    });
  });

  describe('Test clear method', () => {
    test('clear should run without errors', (done) => {
      storeDb.clear((err) => done(err));
    });

    test('Should have no sessions in the db after clear', (done) => {
      storeDb.count((err, count) => {
        if (err) return done(err);
        expect(count).toBe(0);
        return done();
      });
    });
  });
});
