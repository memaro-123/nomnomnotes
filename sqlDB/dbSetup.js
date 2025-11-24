const sqlite3 = require("sqlite3");
const { execute } = require("./dbFunctions.js");
const path = require("path");
const dbPath = path.join(__dirname, "../server/my.db")

const main = async () => {
  const db = new sqlite3.Database(dbPath);
  try {
    await execute(
      db,
      `CREATE TABLE IF NOT EXISTS diary_entries (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL,
    name TEXT NOT NULL,
    selected_cuisines TEXT,
    city TEXT,
    state TEXT,
    selected_prices TEXT,
    selected_labels TEXT,
    images TEXT,
    notes TEXT,
    taste REAL,
    service REAL,
    value REAL
);`
    );
  
    await execute(
      db, 
      `CREATE TABLE IF NOT EXISTS friends (
        user_id TEXT PRIMARY KEY,
        friends TEXT,          
        sent_requests TEXT,    
        received_requests TEXT 
      );`
    );

    console.log("all the tables made right");
  } 
  catch (error) {
    console.log(error);
  } finally {
    db.close();
  }
  

};

main();