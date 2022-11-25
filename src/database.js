const fs = require("fs");

const totalsFileName = "./src/total-database.json";
const logsFileName = "./src/log-database.json";

function getDatabase(fileName) {
  const databaseFile = fs.readFileSync(fileName, "utf8");
  return JSON.parse(databaseFile.toString());
}

function getTotals() {
  return getDatabase(totalsFileName);
}

function getLogs() {
  return getDatabase(logsFileName);
}

function updateTotals({ id, name }) {
  const totalList = getDatabase(totalsFileName);
  let pokemon = totalList.find((pkm) => pkm.id == id);

  if (!pokemon) {
    pokemon = {
      id,
      name,
      count: 0,
    };
    totalList.push(pokemon);
  }

  pokemon.count += 1;

  fs.writeFileSync(totalsFileName, JSON.stringify(totalList));
}

function updateLogs({ id, name, level, user }) {
  const users = getDatabase(logsFileName);
  const date = Date.now();

  users.push({
    id,
    name,
    user,
    level,
    date,
  });

  fs.writeFileSync(logsFileName, JSON.stringify(users));
}

module.exports = { updateLogs, updateTotals, getLogs, getTotals };
