const sinon = require("sinon");
const {
  executeBattle,
  updatePlayer,
  submitBattleResult,
} = require("../src/battleProcessor");
const connection = require("../src/db");

describe("executeBattle", () => {
  before(() => {
    // Stub the database connection
    sinon.stub(connection, "query");
  });

  after(() => {
    // Restore the stubbed functions
    connection.query.restore();
  });

  it("should execute the battle successfully", (done) => {
    // Stub the database query to return the expected results
    const attackerId = 1;
    const defenderId = 2;
    const attacker = {
      id: attackerId,
      name: "Attacker",
      attack: 100,
      hit_points: 1000,
      luck: 10,
      gold: 1000,
    };
    const defender = {
      id: defenderId,
      name: "Defender",
      attack: 100,
      hit_points: 1000,
      luck: 5,
      gold: 1000,
    };
    const results = [attacker, defender];
    connection.query.callsFake((sql, values, callback) => {
      if (sql === "SELECT * FROM Player WHERE id IN (?, ?)") {
        callback(null, results);
      } else {
        callback(new Error("Invalid query"));
      }
    });

    // Stub the updatePlayer and submitBattleResult functions
    sinon.stub(global.console, "log");
    sinon.stub(global.console, "error");
    sinon.stub(global.console, "warn");
    sinon.stub(global.console, "info");
    sinon.stub(global.console, "debug");
    sinon.stub(global.console, "trace");
    sinon.stub(global.console, "dir");
    sinon.stub(global.console, "time");
    sinon.stub(global.console, "timeEnd");
    sinon.stub(global.console, "timeLog");
    sinon.stub(global.console, "assert");
    sinon.stub(global.console, "count");
    sinon.stub(global.console, "countReset");
    sinon.stub(global.console, "group");
    sinon.stub(global.console, "groupCollapsed");
    sinon.stub(global.console, "groupEnd");

    sinon.stub(updatePlayer);
    sinon.stub(submitBattleResult);

    // Define the expected report object
    const expectedReport = {
      attacker: attacker,
      defender: defender,
      attackMissed: false,
      goldStolen: 0,
      defenderDefeated: false,
    };

    // Execute the battle
    executeBattle({ attackerId, defenderId });

    // Verify the behavior
    sinon.assert.calledWithExactly(updatePlayer, sinon.match(attacker));
    sinon.assert.calledWithExactly(updatePlayer, sinon.match(defender));
    sinon.assert.calledWithExactly(
      console.log,
      `Attacker: ${attacker.name}, Defender: ${defender.name}`
    );
    sinon.assert.calledWithExactly(
      console.log,
      `Attacker Attack Value: ${attacker.attack}, Defender Attack Value: ${defender.attack}`
    );
    sinon.assert.calledWithExactly(
      console.log,
      `Attacker Hit Points: ${attacker.hit_points}, Defender Hit Points: ${defender.hit_points}`
    );
    sinon.assert.calledWithExactly(
      console.log,
      "------------------------------------------------------"
    );

    // Restore the stubbed functions
    global.console.log.restore();
    global.console.error.restore();
    global.console.warn.restore();
    global.console.info.restore();
    global.console.debug.restore();
    global.console.trace.restore();
    global.console.dir.restore();
    global.console.time.restore();
    global.console.timeEnd.restore();
    global.console.timeLog.restore();
    global.console.assert.restore();
    global.console.count.restore();
    global.console.countReset.restore();
    global.console.group.restore();
    global.console.groupCollapsed.restore();
    global.console.groupEnd.restore();
    updatePlayer.restore();
    submitBattleResult.restore();

    done();
  });

  // Add more test cases for different scenarios if needed
});

// Add more test cases for other functions if needed
