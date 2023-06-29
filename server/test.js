const request = require("supertest");
const { expect } = require("chai");

// Import your app.js file
const app = require("./app");

// Describe the test suite
describe("Player API", () => {
  let authToken; // Variable to store the authentication token

  before(async () => {
    // Make a POST request to /login to obtain the authentication token
    const credentials = {
      username: "admin",
      password: "password",
    };

    const response = await request(app).post("/login").send(credentials);
    console.log("******" + response.body.token);
    authToken = response.body.token; // Store the token for future use
  });

  // Test the POST /players endpoint
  describe("POST /players", () => {
    it("should create a new player", async () => {
      const requestBody = {
        name: "John",
        gold: 100,
        attack: 50,
        hitPoints: 100,
        luck: 10,
      };

      const response = await request(app)
        .post("/players")
        .set("Authorization", `${authToken}`) // Include the authorization token in the headers
        .send(requestBody);

      expect(response.status).to.equal(200);
      expect(response.body).to.have.property(
        "message",
        "Player created successfully"
      );
    });

    it("should return an error if player details are missing", async () => {
      const requestBody = {
        name: "John",
        attack: 50,
        hitPoints: 100,
        luck: 10,
      };

      const response = await request(app)
        .post("/players")
        .set("Authorization", `${authToken}`) // Include the authorization token in the headers
        .send(requestBody);

      expect(response.status).to.equal(400);
      expect(response.body).to.have.property("error", "Missing player details");
    });
  });

  // Test the POST /battles endpoint
  describe("POST /battles", () => {
    it("should submit a battle successfully", async () => {
      const requestBody = {
        attackerId: 1,
        defenderId: 2,
      };

      const response = await request(app)
        .post("/battles")
        .set("Authorization", `${authToken}`) // Include the authorization token in the headers
        .send(requestBody);

      expect(response.status).to.equal(200);
      expect(response.body).to.have.property(
        "message",
        "Battle submitted successfully"
      );
    });

    it("should return an error if battle details are missing", async () => {
      const requestBody = {
        attackerId: 1,
      };

      const response = await request(app)
        .post("/battles")
        .set("Authorization", `${authToken}`) // Include the authorization token in the headers
        .send(requestBody);

      expect(response.status).to.equal(400);
      expect(response.body).to.have.property("error", "Missing battle details");
    });
  });

  // Test the GET /leaderboard endpoint
  describe("GET /leaderboard", () => {
    it("should retrieve the leaderboard successfully", async () => {
      const response = await request(app)
        .get("/leaderboard")
        .set("Authorization", `${authToken}`); // Include the authorization token in the headers

      expect(response.status).to.equal(200);
      expect(response.body).to.be.an("array");
    });
  });
});
