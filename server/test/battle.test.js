const chai = require("chai");
const chaiHttp = require("chai-http");
const jwt = require("jsonwebtoken");
const app = require("../src/app");

chai.use(chaiHttp);
const expect = chai.expect;

describe("Player API", () => {
  let token;

  // Generate JWT token before running the tests
  before((done) => {
    const secretKey = "your_secret_key";
    token = jwt.sign({ username: "admin" }, secretKey, { expiresIn: "1h" });
    done();
  });

  describe("POST /players", () => {
    it("should create a new player", (done) => {
      const player = {
        name: "John",
        gold: 100,
        attack: 50,
        hitPoints: 100,
        luck: 10,
      };

      chai
        .request(app)
        .post("/players")
        .set("Authorization", token)
        .send(player)
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.have.property(
            "message",
            "Player created successfully"
          );
          done();
        });
    });

    it("should return an error when player details are missing", (done) => {
      const player = {
        name: "John",
        gold: 100,
        // Missing attack, hitPoints, luck
      };

      chai
        .request(app)
        .post("/players")
        .set("Authorization", token)
        .send(player)
        .end((err, res) => {
          expect(res).to.have.status(400);
          expect(res.body).to.have.property("error", "Missing player details");
          done();
        });
    });
  });

  describe("POST /battles", () => {
    it("should queue a battle", (done) => {
      const battle = {
        attackerId: 1,
        defenderId: 2,
      };

      chai
        .request(app)
        .post("/battles")
        .set("Authorization", token)
        .send(battle)
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.have.property("message", "Battle queued");
          done();
        });
    });

    it("should return an error when battle details are missing", (done) => {
      const battle = {
        // Missing attackerId, defenderId
      };

      chai
        .request(app)
        .post("/battles")
        .set("Authorization", token)
        .send(battle)
        .end((err, res) => {
          expect(res).to.have.status(400);
          expect(res.body).to.have.property("error", "Missing battle details");
          done();
        });
    });
  });

  describe("GET /leaderboard", () => {
    it("should retrieve the leaderboard", (done) => {
      chai
        .request(app)
        .get("/leaderboard")
        .set("Authorization", token)
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.be.an("array");
          done();
        });
    });
  });
});
