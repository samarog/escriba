import request from "supertest";
import app from "../app.js";
jest.mock('pg', () => require('./pg.mock.js'));

it("adds a note and then sees it in /notes", async () => {
  const postRes = await request(app).post("/post").type("form").send({ notepost: "Hello World" });
  expect(postRes.statusCode).toBe(302); // redirect happens here

  const notesRes = await request(app).get("/notes");
  expect(notesRes.statusCode).toBe(200); // /notes renders the page
  expect(notesRes.text).toContain("Hello World");
});
