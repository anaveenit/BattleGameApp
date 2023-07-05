const jwt = require("jsonwebtoken");
const { expect } = require("chai");

const auth = require("../src/auth");

describe("Authentication Middleware", () => {
  it("should return an error for missing token", () => {
    const req = {
      headers: {},
    };
    const res = {
      status: (code) => {
        expect(code).to.equal(401);
        return res;
      },
      json: (data) => {
        expect(data).to.deep.equal({ error: "Unauthorized" });
      },
    };
    const next = () => {};

    auth.authenticate(req, res, next);
  });

  it("should return an error for an invalid token", () => {
    const req = {
      headers: {
        authorization: "invalid_token",
      },
    };
    const res = {
      status: (code) => {
        expect(code).to.equal(401);
        return res;
      },
      json: (data) => {
        expect(data).to.deep.equal({ error: "Invalid token" });
      },
    };
    const next = () => {};

    auth.authenticate(req, res, next);
  });

  it("should set req.user for a valid token", () => {
    const token = jwt.sign({ username: "testuser" }, "your_secret_key");
    const req = {
      headers: {
        authorization: token,
      },
    };
    const res = {};
    const next = () => {};

    auth.authenticate(req, res, next);
  });
});
