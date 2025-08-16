import { jest } from '@jest/globals';

jest.unstable_mockModule('pg', async () => {
  const m = await import('./pg.mock.js');
  return { __esModule: true, ...m, default: m.default };
});

const { __reset } = await import('pg');
const { default: app } = await import('../app.js');
import request from 'supertest';

beforeEach(() => __reset());

it('adds a note and then sees it in /notes', async () => {
  const agent = request.agent(app);
  const postRes = await agent
    .post('/post')
    .type('form')
    .send({ notepost: 'Hello World' })
    .redirects(1);

  expect(postRes.statusCode).toBe(200);
  expect(postRes.text).toContain('Hello World');

  const notesRes = await agent.get('/notes');
  
  expect(notesRes.statusCode).toBe(200);
  expect(notesRes.text).toContain('Hello World');
});
