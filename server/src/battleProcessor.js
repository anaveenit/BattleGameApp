// battleProcessor.js
const connection = require("./db");
const battleQueue = require("./queue");

// Execute Battle
const executeBattle = (battle) => {
  // Create an empty report object
  let report = {
    attacker: null,
    defender: null,
    attackMissed: false,
    goldStolen: 0,
    defenderDefeated: false,
  };

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

    // Check if attacker and defender are not undefined
    if (!attacker || !defender) {
      console.error("Attacker or Defender not found");
      return;
    }

    const maxRounds = 1000; // maximum number of rounds in a battle
    let round = 0; // current round

    // Battle loop
    while (
      attacker.hit_points > 0 &&
      defender.hit_points > 0 &&
      round < maxRounds
    ) {
      round++;
      // Calculate damage and update attack values based on hit points
      const attackerDamage = Math.ceil(attacker.hit_points * 0.1);
      const attackerAttackLoss = Math.ceil(
        attacker.attack * (attackerDamage / attacker.hit_points)
      );
      attacker.attack = Math.max(
        attacker.attack - attackerAttackLoss,
        attacker.attack * 0.5
      );

      const defenderDamage = Math.ceil(defender.hit_points * 0.1);
      const defenderAttackLoss = Math.ceil(
        defender.attack * (defenderDamage / defender.hit_points)
      );
      defender.attack = Math.max(
        defender.attack - defenderAttackLoss,
        defender.attack * 0.5
      );

      // Check if attack misses based on defender's luck value
      const isAttackMissed = Math.random() < defender.luck / 100;

      // Process battle outcome
      if (isAttackMissed) {
        console.log("Attack missed");
        report.attackMissed = true;
      } else {
        report.attackMissed = false;
        // Swap attacker and defender roles
        const temp = attacker;
        attacker = defender;
        defender = temp;

        // Reduce hit points of defender
        defender.hit_points -= attackerDamage;

        // Check if defender's hit points reach zero
        if (defender.hit_points <= 0) {
          console.log("Defender defeated");
          report.defenderDefeated = true;

          // Calculate gold stolen between 10% and 20% of defender's total gold
          const goldStolen = Math.floor(
            defender.gold * (Math.random() * 0.1 + 0.1)
          );

          // Update gold amounts for attacker and defender
          attacker.gold += goldStolen;
          defender.gold -= goldStolen;
          report.goldStolen = goldStolen;

          console.log(`Gold Stolen: ${goldStolen}`);

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
      console.log("------------------------------------------------------");

      // Update attacker and defender in the database
      updatePlayer(attacker);
      updatePlayer(defender);

      report.attacker = attacker;
      report.defender = defender;
    }

    if (round === maxRounds) {
      console.log("Battle reached maximum number of rounds");
    }
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
  executeBattle,
  updatePlayer,
  submitBattleResult,
};
