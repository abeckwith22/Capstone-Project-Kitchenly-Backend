const request = require("supertest");

const app = require("./app");
const db = require("./db");

test("not found for site 404", async function () {
    const res = await request(app).get("/no-such-path");
    expect(res.statusCode).toEqual(404);
});

test("not found for site 404 (test stack print)", async function () {
    process.env.NODE_ENV = "";
    const res = await request(app).get("/no-such-path");
    expect(res.statusCode).toEqual(404);
    delete process.env.NODE_ENV;
});

afterAll(function () {
    db.end();
});
