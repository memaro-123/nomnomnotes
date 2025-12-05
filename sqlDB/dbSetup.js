const sqlite3 = require("sqlite3");
const { execute } = require("./dbFunctions.js");
const path = require("path");
const dbPath = path.join(__dirname, "../server/my.db")

// Promise wrapper for db.run so that we can use async/await
/*function runAsync(db, sql) {
  return new Promise((resolve, reject) => {
    db.run(sql, (err) => {
      if (err) reject(err);
      else resolve();
    });
  });
}*/ //  its not needed anymore

const main = async () => {
  const db = new sqlite3.Database(dbPath);
  try {
    console.log("Setting up database tables...");
    await execute(
      db,
      `CREATE TABLE IF NOT EXISTS diary_entries (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id TEXT NOT NULL,
        title TEXT NOT NULL,
        selected_cuisines TEXT,
        location TEXT,
        place_id TEXT,
        lat REAL,
        lng REAL,
        city TEXT,
        selected_prices TEXT,
        selected_labels TEXT,
        images TEXT,
        notes TEXT,
        taste REAL,
        service REAL,
        value REAL,
        date TEXT DEFAULT (DATE('now'))
      );`
    );
    try {
      await execute(db, "ALTER TABLE diary_entries ADD COLUMN city TEXT;");
      console.log("Added city column to diary_entries");
    } catch (e) {
      // Column might already exist
      console.log("City column already exists or error:", e.message);
    }
    console.log("diary_entries table ready");

    await execute(
      db, 
      `CREATE TABLE IF NOT EXISTS friends (
        user_id TEXT PRIMARY KEY,
        friends TEXT default '[]',          
        sent_requests TEXT default '[]',    
        received_requests TEXT default '[]', 
        username TEXT DEFAULT 'defaultUser' 
      );`
    );
    console.log("friends table ready");

    await execute(
      db,
      `CREATE TABLE IF NOT EXISTS wishlist (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id TEXT NOT NULL,
        place_id TEXT NOT NULL,
        name TEXT,
        rating REAL,
        price_level INTEGER,
        types TEXT,
        location TEXT,
        photo_reference TEXT,
        distance REAL,
        created_at DATETIME DEFAULT (DATETIME('now')), 
        UNIQUE(user_id, place_id)
      );`
    );
    console.log("wishlist table ready");

    await execute(
      db, 
      `CREATE TABLE IF NOT EXISTS biteback_reports (
        user_id TEXT,
        year INTEGER,
        data TEXT, -- JSON string of the report data
        generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (user_id, year)
    );
    `);
    console.log("biteback_reports table ready");

    // indexes for better performance, according to google sql index docs
    await execute(
      db,
      `CREATE INDEX IF NOT EXISTS idx_diary_user_date ON diary_entries (user_id, date);`
    );
    await execute(
      db,
      `CREATE INDEX IF NOT EXISTS idx_wishlist_user_place ON wishlist (user_id, place_id);`
    );
    await execute(
      db,
      `CREATE INDEX IF NOT EXISTS idx_biteback_user_year ON biteback_reports (user_id, year);`
    );
    await execute(
      db,
      `CREATE INDEX IF NOT EXISTS idx_friends_user ON friends (user_id);`
    );
    await execute(
      db,
      `CREATE INDEX IF NOT EXISTS diary_user_city ON diary_entries (user_id, city);`
    );
    console.log("Indexes created");

    //verify tables created and exist
    const tables = await new Promise((resolve, reject) => {
      db.all("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name", (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      }
    );
  });
    console.log("DB Setup complete. Current tables in the database:");
    tables.forEach((table) => {
      console.log(`- ${table.name}`);
    });
  } 
  catch (error) {
    console.log("error during db setup", error);
    throw error;
  } finally {
    db.close();
  }
};

main().then(() => {
  console.log("Database setup finished successfully.");
}).catch((err) => {
  console.error("Database setup failed:", err);
  process.exit(1);
});