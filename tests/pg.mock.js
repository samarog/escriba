// tests/pg.mock.js  (ESM)

const store = { notes: [] };

function makeClient() {
  return {
    connect: () => Promise.resolve(),
    end: () => Promise.resolve(),
    query: (sql, params) => {
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
    },
  };
}

const client = makeClient();

// Use classes so it works whether code does `new Pool()` / `new Client()` or plain calls
class Client {
  constructor() {
    return client;
  }
}
class Pool {
  constructor() {
    return client;
  }
}

const pgMock = {
  Client,
  Pool,
  __reset() {
    store.notes = [];
  },
};

export default pgMock;
