// index.js
const express = require("express");
const bodyParser = require("body-parser");
const jwt = require("jsonwebtoken");
const { createPlayer } = require("./players");
const { processBattles, battleQueue } = require("./battleProcessor");
const { getLeaderboard } = require("./leaderboard");
const secretKey = "your_secret_key";

// Create Express app
const app = express();
app.use(bodyParser.json());

// API Routes

// Create a new player
app.post("/players", createPlayer);

// Queue a battle
app.post("/battles", (req, res) => {
  const { attackerId, defenderId } = req.body;

  // Validate input
  if (!attackerId || !defenderId) {
    return res.status(400).json({ error: "Missing battle details" });
  }

  // Add battle to the queue
  battleQueue.push({ attackerId, defenderId });

  // Process battles
  processBattles();

  return res.json({ message: "Battle queued" });
});

// Retrieve leaderboard
app.get("/leaderboard", getLeaderboard);

// Authenticate user and generate token
app.post("/auth", (req, res) => {
  const { username, password } = req.body;

  // Validate username and password
  if (username !== "admin" || password !== "admin123") {
    return res.status(401).json({ error: "Invalid credentials" });
  }

  // Generate JWT token
  const token = jwt.sign({ username }, secretKey, { expiresIn: "1h" });

  return res.json({ token });
});

// Start the server
app.listen(3001, () => {
  console.log("Server listening on port 3000");
});

module.exports = app;
