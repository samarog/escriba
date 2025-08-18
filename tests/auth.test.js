import request from "supertest";
import app from "../app";

// reusable agent
const agent = request.agent(app);

// helper to log in once
async function login() {
  await agent
    .post("/login")
    .send({ email: "test@dummy.com", password: "qwerty" })
    .expect(302);
}

describe("Notes routes", () => {
  beforeAll(async () => {
    // Optionally create a test user first if not already in DB
    await login();
  });

  it("should redirect unauthenticated requests", async () => {
    const res = await request(app).get("/notes"); // plain request, not agent
    expect(res.statusCode).toBe(302);
    expect(res.headers.location).toBe("/");
  });

  it("should show Clear & LEeave button for logged-in user", async () => {
    const res = await agent.get("/notes"); // agent carries the session cookie
    expect(res.statusCode).toBe(200);
    expect(res.text).toContain('<input type="submit" value="Clear & Leave" />');
  });
});