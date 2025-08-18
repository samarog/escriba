import request from "supertest";
import app, { closeDb } from "../app";

test("GET /health returns 200", async () => {
  const res = await request(app).get("/health");
  expect(res.statusCode).toBe(200);
  expect(res.body).toEqual({ ok: true });
});

afterAll(async () => {
  await closeDb(); // close pg.Client so Jest can exit
});