const mockSessions = () => [
  ['123', '{ "test": 1 }', 10000],
  ['124', '{ "test": 2 }', 10000],
  ['125', '{ "test": 1 }', 30000 + Date.now()],
];
exports.mockSessions = mockSessions;

const createDb = (store) => new Promise((resolve, reject) => {
  store.create((err) => (err ? reject(err) : resolve()));
});

const insertSession = (store, sess) => new Promise((resolve, reject) => {
  const query = `INSERT INTO ${store.table} (sid, sess, expired) VALUES(?, ?, ?)`;
  store.client.run(query, sess, (err) => (err ? reject(err) : resolve()));
});

exports.insertMock = async (store) => {
  await createDb(store);
  await Promise.all(mockSessions().map((s) => insertSession(store, s)));
};
