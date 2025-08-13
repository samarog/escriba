import request from "supertest";
import app from "../app.js";

it('should return 200 and a Clear & LEave button', async  () => {
  const res = await request(app).get('/notes');
  expect(res.statusCode).toBe(200);
  expect(res.text).toContain('<input type="submit" value="Clear & Leave" />')
})