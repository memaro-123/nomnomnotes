const path = require("path");
const sqlite3 = require("sqlite3").verbose();

function getDB() {
  const dbPath = path.join(__dirname, "my.db"); 
  return new sqlite3.Database(dbPath);
}

module.exports = getDB;
module.exports.db = getDB;