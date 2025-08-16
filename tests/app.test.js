import { jest } from '@jest/globals';

jest.unstable_mockModule('pg', async () => {
  const m = await import('./pg-mock.test.js');
  return { __esModule: true, ...m, default: m.default };
});

const { __reset } = await import('pg');
const { default: app } = await import('../app.js');

import request from 'supertest';

beforeEach(() => __reset());

test('GET /health returns 200', async () => {
  const res = await request(app).get('/health');
  expect(res.statusCode).toBe(200);
  expect(res.body).toEqual({ ok: true });
});
