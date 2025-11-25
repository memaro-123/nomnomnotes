const sqlite3 = require("sqlite3");
const { execute } = require("./dbFunctions.js");
const path = require("path");
const dbPath = path.join(__dirname, "../server/my.db")

// Promise wrapper for db.run so that we can use async/await
function runAsync(db, sql) {
  return new Promise((resolve, reject) => {
    db.run(sql, (err) => {
      if (err) reject(err);
      else resolve();
    });
  });
}

const main = async () => {
  const db = new sqlite3.Database(dbPath);
  try {
    // Create table of diary entries
    await runAsync(db, `
      CREATE TABLE IF NOT EXISTS diary_entries (
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
      );
    `);

    // Create friends table
    await runAsync(db, `
      CREATE TABLE IF NOT EXISTS friends (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        requester_id TEXT NOT NULL,
        receiver_id TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'pending',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(requester_id, receiver_id)
      );
    `);

    console.log("Database setup complete!");
  } catch (err) {
    console.error("Error setting up database:", err);
  } finally {
    db.close();
  }
};

main();