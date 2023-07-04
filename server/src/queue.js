const Queue = require("bull");
const battleQueue = new Queue("battle", "redis://127.0.0.1:6379");

module.exports = battleQueue;
