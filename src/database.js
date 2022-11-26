const fs = require("fs");
const fileName = "./src/database.json";

function getDatabase() {
  const databaseFile = fs.readFileSync(fileName, "utf8");
  return JSON.parse(databaseFile.toString());
}

function updateDatabase(rows) {
  const rowsJson = JSON.stringify(rows);
  fs.writeFileSync(fileName, rowsJson);
}

module.exports = { getDatabase, updateDatabase };
