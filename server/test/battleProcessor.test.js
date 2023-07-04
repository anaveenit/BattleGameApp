const assert = require("assert");
const sinon = require("sinon");
const battleProcessor = require("./battleProcessor");
const connection = require("./db");

// Mock the database connection and query methods
const connectionMock = {
  query: sinon.stub(),
};

// Mock the battle object
const battleMock = {
  attackerId: 1,
  defenderId: 2,
};

// Mock the players retrieved from the database
const player1Mock = {
  id: 1,
  name: "player1",
  gold: 100,
  attack: 80,
  hit_points: 100,
  luck: 10,
};

const player2Mock = {
  id: 2,
  name: "player2",
  gold: 100,
  attack: 80,
  hit_points: 100,
  luck: 10,
};

// Mock the database query results
const queryResultsMock = [player1Mock, player2Mock];

describe("Battle Processor", () => {
  let connectionStub;

  beforeEach(() => {
    // Reset the stubs before each test
    connectionMock.query.reset();

    // Stub the database connection query method to return the mocked results
    connectionStub = sinon
      .stub(connection, "query")
      .callsFake((sql, values, callback) => {
        callback(null, queryResultsMock);
      });
  });

  afterEach(() => {
    // Restore the original methods after each test
    connectionStub.restore();
  });

  it("should execute battle and update players' data", (done) => {
    // Stub the submitBattleResult method
    const submitBattleResultStub = sinon.stub(
      battleProcessor,
      "submitBattleResult"
    );

    // Call the executeBattle method
    battleProcessor.executeBattle(battleMock);

    // Verify that the database query was called with the correct SQL and values
    assert(connectionMock.query.calledOnce);
    assert.deepStrictEqual(
      connectionMock.query.getCall(0).args[0],
      "SELECT * FROM Player WHERE id IN (?, ?)"
    );
    assert.deepStrictEqual(connectionMock.query.getCall(0).args[1], [1, 2]);

    // Verify that the submitBattleResult method was called once with the correct arguments
    assert(submitBattleResultStub.calledOnce);
    assert.deepStrictEqual(submitBattleResultStub.getCall(0).args, [
      1,
      sinon.match.number,
    ]); // playerId and goldStolen

    // Restore the original methods
    submitBattleResultStub.restore();

    done();
  });

  it("should log battle details when executing battle", (done) => {
    // Stub the console.log method to capture logs
    const consoleLogStub = sinon.stub(console, "log");

    // Call the executeBattle method
    battleProcessor.executeBattle(battleMock);

    // Verify that the console.log method was called with the expected battle details
    assert(
      consoleLogStub.calledWith(
        `Attacker: ${player2Mock.name}, Defender: ${player1Mock.name}`
      )
    );
    assert(
      consoleLogStub.calledWith(
        `Attacker Attack Value: ${player2Mock.attack}, Defender Attack Value: ${player1Mock.attack}`
      )
    );
    assert(
      consoleLogStub.calledWith(
        `Attacker Hit Points: ${player2Mock.hit_points}, Defender Hit Points: ${player1Mock.hit_points}`
      )
    );

    // Restore the original methods
    consoleLogStub.restore();

    done();
  });
});
