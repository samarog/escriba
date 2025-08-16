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

export class Client {
  constructor() {
    return client;
  }
}
export class Pool {
  constructor() {
    return client;
  }
}
export function __reset() {
  store.notes = [];
}

// default export too (helps if code imports default from 'pg')
const defaultExport = { Client, Pool, __reset };
export default defaultExport;
