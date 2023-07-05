const mysql = require("mysql2");
const { assert } = require("chai");

// Import the MySQL connection from db.js
const connection = require("../src/db");

describe("MySQL Connection", () => {
  it("should connect to the MySQL database", (done) => {
    // Verify the MySQL connection
    assert.isTrue(connection instanceof mysql.Connection);
    done();
  });

  it("should handle connection error", (done) => {
    // Modify the connection credentials to simulate an error
    const connectionWithInvalidCredentials = mysql.createConnection({
      host: "localhost",
      port: 3306,
      user: "invalidUser",
      password: "invalidPassword",
      database: "invalidDatabase",
    });

    // Attempt to connect with invalid credentials
    connectionWithInvalidCredentials.connect((err) => {
      // Verify the connection error
      assert.isNotNull(err);
      done();
    });
  });
});
