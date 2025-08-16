import { jest } from '@jest/globals';

jest.unstable_mockModule('pg', () => import('./pg.mock.js'));

const { __reset } = await import('./pg.mock.js');
const { default: app } = await import('../app.js');

import request from 'supertest';

beforeEach(() => __reset());

it('should return 200 and a Clear & LEave button', async  () => {
  const res = await request(app).get('/notes');
  expect(res.statusCode).toBe(200);
  expect(res.text).toContain('<input type="submit" value="Clear & Leave" />')
})
