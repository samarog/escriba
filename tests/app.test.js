import request from "supertest";
import app from "../app";

test('GET /health returns 200', async () => {
  const res = await request(app).get('/health');
  expect(res.statusCode).toBe(200);
  expect(res.body).toEqual({ ok: true });
});
