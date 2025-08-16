// pg.mock.js

const store = { notes: [] }; // move store outside so we can reset it

const makeClient = () => ({
  connect: jest.fn().mockResolvedValue(),
  end: jest.fn().mockResolvedValue(),
  query: jest.fn((sql, params) => {
    const q = String(sql).toLowerCase();

    if (q.includes('insert into notes')) {
      const body = params?.[0] ?? params?.[1] ?? '';
      const id = store.notes.length + 1;
      store.notes.push({ id, body });
      return Promise.resolve({ rows: [{ id, body }] });
    }

    if (q.includes('select') && q.includes('from notes')) {
      return Promise.resolve({ rows: [...store.notes] });
    }

    return Promise.resolve({ rows: [] });
  }),
});

const client = makeClient();

module.exports = {
  Client: jest.fn(() => client),
  Pool: jest.fn(() => client),
  __reset: () => {
    store.notes = [];
    client.query.mockClear();
    client.connect.mockClear();
    client.end.mockClear();
  },
};
