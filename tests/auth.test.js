import request from "supertest";
import app, { closeDb } from "../app";

const agent = request.agent(app);

const email = "test@dummy.com";
const password = "qwerty";

async function registerAndLogin() {
  await agent
    .post("/register")
    .type("form")
    .send({ email, password })
    .expect(302);

  await agent
    .post("/login")
    .type("form")
    .send({ email, password })
    .expect(302);
}

describe("Notes routes", () => {
  beforeAll(async () => {
    await registerAndLogin();
  });

  afterAll(async () => {
    await closeDb();
  });

  it("should redirect unauthenticated requests", async () => {
    const res = await request(app).get("/notes");
    expect(res.statusCode).toBe(302);
    expect(res.headers.location).toBe("/");
  });

  it("should show notes page for logged-in user", async () => {
    const res = await agent.get("/notes");
    expect(res.statusCode).toBe(200);
    expect(res.text).toContain('value="Clear & Leave"'); // adjust if needed
  });
});
