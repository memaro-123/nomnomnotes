const sqlite3 = require('sqlite3').verbose()

describe('BiteBack SQL Query Tests', () => {
  let db

  beforeAll((done) => {
    db = new sqlite3.Database(':memory:', done)
  })

  afterAll((done) => {
    db.close(done)
  })

  beforeEach((done) => {
    db.serialize(() => {
      // Ensure a clean table exists for each test
      db.run(`DROP TABLE IF EXISTS diary_entries`, (dropErr) => {
        if (dropErr) return done(dropErr)
        db.run(`
          CREATE TABLE diary_entries (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id TEXT NOT NULL,
            title TEXT NOT NULL,
            selected_cuisines TEXT,
            location TEXT,
            selected_prices TEXT,
            taste REAL,
            service REAL,
            value REAL,
            date TEXT
          )
        `, done)
      })
    })
  })

  afterEach((done) => {
    db.run('DELETE FROM diary_entries', done)
  })

  test('most active month query works correctly', (done) => {
    // Insert test data
    const insertStmt = db.prepare(`
      INSERT INTO diary_entries (user_id, title, selected_cuisines, location, selected_prices, taste, service, value, date)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `)

    const userId = 'test-user-123'
    
    // March entries (ISO date format)
    insertStmt.run(userId, 'Entry 1', '["Italian"]', '{"name": "Test"}', '$$', 4, 4, 4, '2024-03-15')
    insertStmt.run(userId, 'Entry 2', '["Italian"]', '{"name": "Test"}', '$$', 4, 4, 4, '2024-03-20')
    
    // April entries (more) - ISO date format
    insertStmt.run(userId, 'Entry 3', '["Chinese"]', '{"name": "Test"}', '$$$', 5, 5, 5, '2024-04-10')
    insertStmt.run(userId, 'Entry 4', '["Chinese"]', '{"name": "Test"}', '$$$', 5, 5, 5, '2024-04-15')
    insertStmt.run(userId, 'Entry 5', '["Chinese"]', '{"name": "Test"}', '$$$', 5, 5, 5, '2024-04-20')

    insertStmt.finalize(() => {
      // Test the query
      db.get(`
        SELECT 
          strftime('%m', date) as month,
          COUNT(*) as entry_count
        FROM diary_entries 
        WHERE user_id = ?
        GROUP BY strftime('%m', date)
        ORDER BY entry_count DESC
        LIMIT 1
      `, [userId], (err, row) => {
        expect(err).toBeNull()
        expect(row.month).toBe('04') // April should be most active
        expect(row.entry_count).toBe(3)
        done()
      })
    })
  })

  test('favorite cuisine query handles JSON arrays', (done) => {
    const insertStmt = db.prepare(`
      INSERT INTO diary_entries (user_id, title, selected_cuisines, location, selected_prices, taste, service, value, date)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `)

    const userId = 'test-user-123'
    
    // Italian cuisine entries
    insertStmt.run(userId, 'Entry 1', '["Italian", "Pizza"]', '{"name": "Test"}', '$$', 4, 4, 4, '2024-03-15')
    insertStmt.run(userId, 'Entry 2', '["Italian", "Pasta"]', '{"name": "Test"}', '$$', 4, 4, 4, '2024-03-20')
    
    // Chinese cuisine entry
    insertStmt.run(userId, 'Entry 3', '["Chinese"]', '{"name": "Test"}', '$$$', 5, 5, 5, '2024-04-10')

    insertStmt.finalize(() => {
      // This query should extract individual cuisines from JSON arrays
      db.all(`
        SELECT 
          json_each.value as cuisine,
          COUNT(*) as count
        FROM diary_entries,
        json_each(selected_cuisines)
        WHERE user_id = ?
        GROUP BY json_each.value
        ORDER BY count DESC
      `, [userId], (err, rows) => {
        expect(err).toBeNull()
        
        // Italian should appear 2 times (from both entries)
        const italianRow = rows.find(r => r.cuisine === 'Italian')
        expect(italianRow.count).toBe(2)
        
        // Pizza and Pasta should appear 1 time each
        const pizzaRow = rows.find(r => r.cuisine === 'Pizza')
        expect(pizzaRow.count).toBe(1)
        
        const pastaRow = rows.find(r => r.cuisine === 'Pasta')
        expect(pastaRow.count).toBe(1)
        
        // Chinese should appear 1 time
        const chineseRow = rows.find(r => r.cuisine === 'Chinese')
        expect(chineseRow.count).toBe(1)
        
        done()
      })
    })
  })

  test('top rated restaurant query works with JSON location', (done) => {
    const insertStmt = db.prepare(`
      INSERT INTO diary_entries (user_id, title, selected_cuisines, location, selected_prices, taste, service, value, date)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `)

    const userId = 'test-user-123'
    
    // Restaurant A with high rating
    insertStmt.run(userId, 'Entry 1', '["Italian"]', '{"name": "Restaurant A"}', '$$', 5, 5, 5, '2024-03-15')
    insertStmt.run(userId, 'Entry 2', '["Italian"]', '{"name": "Restaurant A"}', '$$', 4, 4, 4, '2024-03-20')
    
    // Restaurant B with perfect rating
    insertStmt.run(userId, 'Entry 3', '["Chinese"]', '{"name": "Restaurant B"}', '$$$', 5, 5, 5, '2024-04-10')

    insertStmt.finalize(() => {
      db.get(`
        SELECT 
          json_extract(location, '$.name') as restaurant_name,
          AVG((taste + service + value) / 3.0) as avg_rating
        FROM diary_entries 
        WHERE user_id = ?
          AND json_extract(location, '$.name') IS NOT NULL
          AND taste > 0 AND service > 0 AND value > 0
        GROUP BY json_extract(location, '$.name')
        ORDER BY avg_rating DESC
        LIMIT 1
      `, [userId], (err, row) => {
        expect(err).toBeNull()
        expect(row.restaurant_name).toBe('Restaurant B')
        expect(row.avg_rating).toBe(5.0) // Perfect score
        done()
      })
    })
  })
})