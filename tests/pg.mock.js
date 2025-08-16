const makeClient = () => {
  const store = { notes: [] };

  const client = {
    connect: jest.fn().mockResolvedValue(),
    end: jest.fn().mockResolvedValue(),
    query: jest.fn((sql, params) => {
      const q = String(sql);

      // Very light, case-insensitive matching for your tests
      if (/insert\s+into\s+notes/i.test(q)) {
        const body = params?.[0] ?? params?.[1] ?? "";
        const id = store.notes.length + 1;
        store.notes.push({ id, body });
        return Promise.resolve({ rows: [{ id, body }] });
      }

      if (/select.*from\s+notes/i.test(q)) {
        return Promise.resolve({ rows: store.notes });
      }

      // Fallback
      return Promise.resolve({ rows: [] });
    }),
  };

  return client;
};

const client = makeClient();

module.exports = {
  // Support either Client or Pool usage
  Client: jest.fn(() => client),
  Pool: jest.fn(() => client),
};
