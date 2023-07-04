// battleProcessor.js
const connection = require("./db");

// Battle Processor Queue
const battleQueue = [];

let battles = [];

// Attacker ID, Attacker Name, Attacker Attack, Attacker Hit Points, Attacker Luck, Attacker Gold,
// Defender ID, Defender Name, Defender Attack, Defender Hit Points, Defender Luck, Defender Gold
battles.push({
  attacker_id: 1,
  attacker_name: "Player A",
  attacker_attack: 70,
  attacker_hit_points: 100,
  attacker_luck: 30,
  attacker_gold: 1000,
  defender_id: 2,
  defender_name: "Player B",
  defender_attack: 80,
  defender_hit_points: 100,
  defender_luck: 20,
  defender_gold: 2000,
});

battles.push({
  attacker_id: 3,
  attacker_name: "Player C",
  attacker_attack: 60,
  attacker_hit_points: 90,
  attacker_luck: 40,
  attacker_gold: 1500,
  defender_id: 4,
  defender_name: "Player D",
  defender_attack: 90,
  defender_hit_points: 110,
  defender_luck: 15,
  defender_gold: 2500,
});

battles.push({
  attacker_id: 5,
  attacker_name: "Player E",
  attacker_attack: 75,
  attacker_hit_points: 120,
  attacker_luck: 25,
  attacker_gold: 1800,
  defender_id: 6,
  defender_name: "Player F",
  defender_attack: 85,
  defender_hit_points: 80,
  defender_luck: 10,
  defender_gold: 2200,
});

let battleStrings = battles.map((battle) => {
  return `${battle.attacker_id}|${battle.attacker_name}|${battle.attacker_attack}|${battle.attacker_hit_points}|${battle.attacker_luck}|${battle.attacker_gold}|${battle.defender_id}|${battle.defender_name}|${battle.defender_attack}|${battle.defender_hit_points}|${battle.defender_luck}|${battle.defender_gold}`;
});

const array = ["1,000", "2,000", "3,000"];

const modifiedArray = battleStrings.map((element) => element.replace(/,/g, ""));
const modifiedString = modifiedArray
  .map((element) => `"${element}"`)
  .join("\n");

console.log(modifiedString);

const { exec } = require("child_process");

const scriptPath = "./src/battleScript.sh";

const command = `sh ${scriptPath} ${modifiedString}`;

exec(command, (error, stdout, stderr) => {
  if (error) {
    console.error(`Error executing the shell script: ${error}`);
    return;
  }

  if (stderr) {
    console.error(`Error output from the shell script: ${stderr}`);
    return;
  }

  console.log(`Output from the shell script: ${stdout}`);
});

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
