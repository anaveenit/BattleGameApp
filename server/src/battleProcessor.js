// battleProcessor.js
const connection = require("./db");

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

    let attacker = results.find((player) => player.id === attackerId);
    let defender = results.find((player) => player.id === defenderId);

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

module.exports = {
  processBattles,
  battleQueue,
};
