// players.js
const { authenticate } = require("./auth");
const connection = require("./db");

// Create player
const createPlayer = (req, res) => {
  const { name, gold, attack, hitPoints, luck } = req.body;

  // Validate input
  if (!name || !gold || !attack || !hitPoints || !luck) {
    return res.status(400).json({ error: "Missing player details" });
  }

  // Insert player into the database
  const sql =
    "INSERT INTO Player (name, gold, attack, hit_points, luck) VALUES (?, ?, ?, ?, ?)";
  const values = [name, gold, attack, hitPoints, luck];
  connection.query(sql, values, (err, result) => {
    if (err) {
      console.error("Error creating player:", err);
      return res.status(500).json({ error: "Failed to create player" });
    }
    return res.json({ message: "Player created successfully" });
  });
};

module.exports = {
  createPlayer,
};
