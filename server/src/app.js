// index.js
const express = require("express");
const bodyParser = require("body-parser");
const jwt = require("jsonwebtoken");
const { createPlayer } = require("./players");
// const { processBattles } = require("./battleProcessor");
const battleQueue = require("./queue");
const { getLeaderboard } = require("./leaderboard");
const secretKey = "your_secret_key";
const { authenticate } = require("./auth"); // Require the authenticate middleware

// Create Express app
const app = express();
app.use(bodyParser.json());

const { executeBattle } = require("./battleProcessor");

// Battle Processor
battleQueue.process(async (job, done) => {
  console.log("In BattleQueue");
  const battle = job.data;
  await executeBattle(battle);

  done();
});

// API Routes

// Create a new player
app.post("/players", authenticate, createPlayer);

// Queue a battle
app.post("/battles", authenticate, (req, res) => {
  const { attackerId, defenderId } = req.body;

  // Validate input
  if (!attackerId || !defenderId) {
    return res.status(400).json({
      error: "Missing battle details" + attackerId + "," + defenderId,
    });
  }

  // Add battle to the queue
  battleQueue.add({ attackerId, defenderId });

  // // Process battles
  // processBattles();

  return res.json({ message: "Battle queued" });
});

// Retrieve leaderboard
app.get("/leaderboard", authenticate, getLeaderboard);

// Authenticate user and generate token
app.post("/auth", (req, res) => {
  const { username, password } = req.body;

  // Validate username and password
  if (username !== "admin" || password !== "password") {
    return res.status(401).json({ error: "Invalid credentials" });
  }

  // Generate JWT token
  const token = jwt.sign({ username }, secretKey, { expiresIn: "1h" });

  return res.json({ token });
});

// Authenticate user and generate token
app.get("/health", (req, res) => {
  const { username, password } = req.body;

  return res.json("Health check success");
});

// Start the server
app.listen(3001, () => {
  console.log("Server listening on port 3000");
});

module.exports = app;
