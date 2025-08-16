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

module.exports = {
  // Support both Client and Pool usage
  Client: function () { return client; },
  Pool: function () { return client; },
  __reset: () => { store.notes = []; },
};
