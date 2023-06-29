const express = require("express");
const bodyParser = require("body-parser");
const mysql = require("mysql2");
const jwt = require("jsonwebtoken");

const app = express();
app.use(bodyParser.json());

// // Create MySQL connection
const connection = mysql.createConnection({
  host: "localhost",
  port: 3306,
  user: "root",
  password: "navsat3426",
  database: "battle",
});

// // Connect to MySQL
connection.connect((err) => {
  if (err) {
    console.error("Error connecting to MySQL:", err);
  } else {
    console.log("Connected to MySQL database");
  }
});

// JWT Secret Key
const secretKey = "your_secret_key";

// Middleware to authenticate requests
const authenticate = (req, res, next) => {
  const token = req.headers.authorization;

  if (!token) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  jwt.verify(token, secretKey, (err, decoded) => {
    if (err) {
      return res.status(401).json({ error: "Invalid token" });
    }

    req.user = decoded;
    next();
  });
};

// Battle Processor Queue
const battleQueue = [];

// Battle Processor
const processBattles = () => {
  if (battleQueue.length > 0) {
    const battle = battleQueue.shift();
    executeBattle(battle);
  }
};

// Execute Battle
const executeBattle = (battle) => {
  // Retrieve attacker and defender from battle object
  const { attackerId, defenderId } = battle;

  // Fetch attacker and defender details from the database
  const sql = "SELECT * FROM Player WHERE id IN (?, ?)";
  const values = [attackerId, defenderId];
  connection.query(sql, values, (err, results) => {
    if (err) {
      console.error("Error retrieving players for battle:", err);
      return;
    }

    if (results.length !== 2) {
      console.error("Invalid players for battle");
      return;
    }

    const attacker = results.find((player) => player.id === attackerId);
    const defender = results.find((player) => player.id === defenderId);

    // Calculate damage and update attack values based on hit points
    const attackerDamage = Math.ceil(attacker.hit_points * 0.1);
    attacker.attack = Math.max(
      Math.floor(attacker.attack - attackerDamage),
      Math.floor(attacker.attack * 0.5)
    );

    const defenderDamage = Math.ceil(defender.hit_points * 0.1);
    defender.attack = Math.max(
      Math.floor(defender.attack - defenderDamage),
      Math.floor(defender.attack * 0.5)
    );

    // Check if attack misses based on defender's luck value
    const isAttackMissed = Math.random() < defender.luck / 100;

    // Process battle outcome
    if (isAttackMissed) {
      console.log("Attack missed");
    } else {
      // Swap attacker and defender roles
      const temp = attacker;
      attacker = defender;
      defender = temp;

      // Reduce hit points of defender
      defender.hit_points -= attackerDamage;

      // Check if defender's hit points reach zero
      if (defender.hit_points <= 0) {
        console.log("Defender defeated");

        // Calculate gold stolen between 10% and 20% of defender's total gold
        const goldStolen = Math.floor(
          defender.gold * (Math.random() * 0.1 + 0.1)
        );

        // Update gold amounts for attacker and defender
        attacker.gold += goldStolen;
        defender.gold -= goldStolen;

        // Submit battle result to leaderboard
        submitBattleResult(attacker.id, goldStolen);
      } else {
        console.log("Battle inconclusive, defender still has hit points");
      }
    }

    // Log battle details
    console.log(`Attacker: ${attacker.name}, Defender: ${defender.name}`);
    console.log(
      `Attacker Attack Value: ${attacker.attack}, Defender Attack Value: ${defender.attack}`
    );
    console.log(
      `Attacker Hit Points: ${attacker.hit_points}, Defender Hit Points: ${defender.hit_points}`
    );

    // Update attacker and defender in the database
    updatePlayer(attacker);
    updatePlayer(defender);

    // Process next battle
    processBattles();
  });
};

// Submit Battle Result to Leaderboard
const submitBattleResult = (playerId, goldStolen) => {
  // Update leaderboard with gold stolen for the player
  const sql = "UPDATE Player SET gold = gold + ? WHERE id = ?";
  const values = [goldStolen, playerId];
  connection.query(sql, values, (err, result) => {
    if (err) {
      console.error("Error updating leaderboard:", err);
    }
  });
};

// Update Player in the database
const updatePlayer = (player) => {
  const sql =
    "UPDATE Player SET gold = ?, attack = ?, hit_points = ?, luck = ? WHERE id = ?";
  const values = [
    player.gold,
    player.attack,
    player.hit_points,
    player.luck,
    player.id,
  ];
  connection.query(sql, values, (err, result) => {
    if (err) {
      console.error("Error updating player:", err);
    }
  });
};

// Create player
app.post("/players", authenticate, (req, res) => {
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
});

// Submit battle
app.post("/battles", authenticate, (req, res) => {
  const { attackerId, defenderId } = req.body;

  // Validate input
  if (!attackerId || !defenderId) {
    return res.status(400).json({ error: "Missing battle details" });
  }

  // Add battle to the queue
  battleQueue.push({ attackerId, defenderId });

  // Process battles
  processBattles();

  res.json({ message: "Battle submitted successfully" });
});

// Retrieve leaderboard
app.get("/leaderboard", authenticate, (req, res) => {
  // Retrieve list of all players ordered by score
  const sql =
    "SELECT id, name, (gold * 0.1) AS score FROM Player ORDER BY score DESC";
  connection.query(sql, (err, results) => {
    if (err) {
      console.error("Error retrieving leaderboard:", err);
      return res.status(500).json({ error: "Failed to retrieve leaderboard" });
    }
    res.json(results);
  });
});

// Login endpoint (public endpoint)
app.post("/login", (req, res) => {
  const { username, password } = req.body;

  // TODO: Implement your login logic here to authenticate the user

  // Mock user authentication for demonstration purposes
  if (username === "admin" && password === "password") {
    // User is authenticated, generate a JWT token
    const token = jwt.sign({ username: username }, secretKey);
    res.json({ token });
  } else {
    res.status(401).json({ error: "Invalid credentials" });
  }
});

// Start the server
const port = 3001;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

module.exports = app;
