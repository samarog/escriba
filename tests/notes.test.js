import { jest } from '@jest/globals';

jest.unstable_mockModule('pg', async () => {
  const m = await import('./pg-mock.test.js');
  return { __esModule: true, ...m, default: m.default };
});

const { __reset } = await import('pg');
const { default: app } = await import('../app.js');

import request from 'supertest';

beforeEach(() => __reset());

it('should return 200 and a Clear & LEave button', async  () => {
  const res = await request(app).get('/notes');
  expect(res.statusCode).toBe(200);
  expect(res.text).toContain('<input type="submit" value="Clear & Leave" />')
})
