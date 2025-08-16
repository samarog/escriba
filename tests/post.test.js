import { jest } from '@jest/globals';
jest.unstable_mockModule('pg', () => import('./pg.mock.js'));

const { __reset } = await import('./pg.mock.js');
const { default: app } = await import('../app.js');

import request from 'supertest';

beforeEach(() => __reset());

it('adds a note and then sees it in /notes', async () => {
  const postRes = await request(app).post('/post').type('form').send({ notepost: 'Hello World' });
  expect(postRes.statusCode).toBe(302);

  const notesRes = await request(app).get('/notes');
  expect(notesRes.statusCode).toBe(200);
  expect(notesRes.text).toContain('Hello World');
});
