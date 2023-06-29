// leaderboard.js
const { authenticate } = require("./auth");
const connection = require("./db");

// Retrieve leaderboard
const getLeaderboard = (req, res) => {
  // Retrieve list of all players ordered by score
  const sql =
    "SELECT id, name, gold, attack, hit_points, luck FROM Player ORDER BY gold DESC";
  connection.query(sql, (err, results) => {
    if (err) {
      console.error("Error retrieving leaderboard:", err);
      return res.status(500).json({ error: "Failed to retrieve leaderboard" });
    }
    return res.json(results);
  });
};

module.exports = {
  getLeaderboard,
};
