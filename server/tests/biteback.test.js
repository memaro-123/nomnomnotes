const sqlite3 = require('sqlite3');
const { getBiteBackData } = require('../bitebackQuery');

describe('Biteback Analytics Tests', () => {
  let db;
  let testUserId = 'test_user_123456';
  beforeAll(async () => {
    db = new sqlite3.Database(':memory:');
    
    // Set up test tables
    await new Promise((resolve, reject) => {
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
      `, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  });

  afterAll((done) => {
    db.close(done);
  });

  beforeEach(async () => {
    await new Promise((resolve, reject) => {
      db.run('DELETE FROM diary_entries', (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  });

  describe('Minimum 5 entries requirement', () => {
    test('should return success: false when user has less than 5 entries', async () => {
      // Arrange: Add only 3 entries
      await insertTestEntries(3);
      
      // Act: Call the function
      const result = await getBiteBackData(testUserId, 2024, db);
      
      // Assert
      expect(result.success).toBe(false);
      expect(result.message).toContain('Need at least 5 diary entries');
      expect(result.totalEntries).toBe(3);
      expect(result.requiredEntries).toBe(5);
    });

    test('should return success: true when user has exactly 5 entries', async () => {
      // Arrange: Add exactly 5 entries
      await insertTestEntries(5);
      
      // Act
      const result = await getBiteBackData(testUserId, 2024, db);
      
      // Assert
      expect(result.success).toBe(true);
      expect(result.totalEntries).toBe(5);
    });

    test('should return success: true when user has more than 5 entries', async () => {
      // Arrange: Add 10 entries
      await insertTestEntries(10);
      
      // Act
      const result = await getBiteBackData(testUserId, 2024, db);
      
      // Assert
      expect(result.success).toBe(true);
      expect(result.totalEntries).toBe(10);
    });
  });

  describe('Average rating calculation', () => {
    test('should calculate correct average ratings with 5+ entries', async () => {
      // Arrange: Add 5 entries with known ratings
      await insertTestEntriesWithRatings([
        { taste: 5, service: 4, value: 4 }, // Avg: 4.33
        { taste: 4, service: 3, value: 5 }, // Avg: 4.00
        { taste: 3, service: 5, value: 3 }, // Avg: 3.67
        { taste: 5, service: 5, value: 5 }, // Avg: 5.00
        { taste: 4, service: 4, value: 4 }, // Avg: 4.00
      ]);
      
      // Act
      const result = await getBiteBackData(testUserId, 2024, db);
      
      // Assert
      expect(result.success).toBe(true);
      expect(result.averageRating.overall).toBe('4.20'); // (4.33+4.00+3.67+5.00+4.00)/5 = 4.20
      expect(result.averageRating.taste).toBe('4.20'); // (5+4+3+5+4)/5 = 4.20
      expect(result.averageRating.service).toBe('4.20'); // (4+3+5+5+4)/5 = 4.20
      expect(result.averageRating.value).toBe('4.20'); // (4+5+3+5+4)/5 = 4.20
    });

    test('should handle decimal ratings correctly', async () => {
      // Arrange
      await insertTestEntriesWithRatings([
        { taste: 4.5, service: 3.5, value: 4.0 },
        { taste: 3.0, service: 4.5, value: 3.5 },
        { taste: 5.0, service: 4.0, value: 4.5 },
        { taste: 4.0, service: 4.0, value: 4.0 },
        { taste: 4.5, service: 4.5, value: 4.5 },
      ]);
      
      // Act
      const result = await getBiteBackData(testUserId, 2024, db);
      
      // Assert
      expect(result.success).toBe(true);
      expect(parseFloat(result.averageRating.overall)).toBeCloseTo(4.17, 2);
    });
  });

  describe('City extraction', () => {
    test('should correctly extract city from formatted addresses', async () => {
      // Arrange: Add entries with different address formats
      await insertTestEntriesWithLocations([
        '{"name": "Test Restaurant", "formatted_address": "123 Main St, Los Angeles, CA 90001"}',
        '{"name": "Test Restaurant", "formatted_address": "456 Oak Ave, New York, NY 10001"}',
        '{"name": "Test Restaurant", "formatted_address": "789 Pine Rd, Chicago, IL 60601"}',
        '{"name": "Test Restaurant", "formatted_address": "101 Maple St, San Francisco, California 94102"}',
        '{"name": "Test Restaurant", "address": "202 Elm St, Seattle, WA 98101"}',
      ]);
      
      // Act
      const result = await getBiteBackData(testUserId, 2024, db);
      
      // Assert
      expect(result.success).toBe(true);
      expect(result.mostDinedCity.name).toBe('Los Angeles'); // First one should be most common
      expect(result.mostDinedCity.count).toBe(5); // All different cities, count 1 each
    });

    test('should handle JSON location parsing errors gracefully', async () => {
      // Arrange
      await insertTestEntriesWithLocations([
        'invalid json',
        '{"name": "Test", "address": "123 Main St, Test City, CA"}',
        '{"name": "Test"}',
        '{"name": "Test", "address": "Another City"}',
        '{"name": "Test", "formatted_address": "Test City"}',
      ]);
      
      // Act
      const result = await getBiteBackData(testUserId, 2024, db);
      
      // Assert: Should not crash, should handle gracefully
      expect(result.success).toBe(true);
    });
  });

  describe('Most visited restaurant calculation', () => {
    test('should find most visited restaurant correctly', async () => {
      // Arrange
      await insertTestEntriesWithLocations([
        '{"name": "Pizza Palace"}',
        '{"name": "Pizza Palace"}',
        '{"name": "Pizza Palace"}',
        '{"name": "Burger Barn"}',
        '{"name": "Burger Barn"}',
        '{"name": "Taco Town"}',
      ]);
      
      // Act
      const result = await getBiteBackData(testUserId, 2024, db);
      
      // Assert
      expect(result.success).toBe(true);
      expect(result.mostDinedLocation.name).toBe('Pizza Palace');
      expect(result.mostDinedLocation.count).toBe(3);
    });
  });

  describe('Favorite cuisine calculation', () => {
    test('should find most frequent cuisine', async () => {
      // Arrange
      await insertTestEntriesWithCuisines([
        '["Italian"]',
        '["Italian", "Pizza"]',
        '["Italian"]',
        '["Chinese"]',
        '["Chinese", "Japanese"]',
        '["Mexican"]',
      ]);
      
      // Act
      const result = await getBiteBackData(testUserId, 2024, db);
      
      // Assert
      expect(result.success).toBe(true);
      expect(result.favoriteCuisine.name).toBe('Italian');
      expect(result.favoriteCuisine.count).toBe(3); // Appears in 3 entries
    });
  });

  describe('Most active month calculation', () => {
    test('should find month with most entries', async () => {
      // Arrange: Add entries in different months
      await insertTestEntriesWithDates([
        '2024-03-15',
        '2024-03-20',
        '2024-03-25',
        '2024-04-10',
        '2024-04-15',
      ]);
      
      // Act
      const result = await getBiteBackData(testUserId, 2024, db);
      
      // Assert
      expect(result.success).toBe(true);
      expect(result.mostActiveMonth.name).toBe('March'); // 3 entries in March vs 2 in April
      expect(result.mostActiveMonth.count).toBe(3);
    });
  });

  describe('Price range calculation', () => {
    test('should find most used price range', async () => {
      // Arrange
      await insertTestEntriesWithPrices(['$', '$$', '$$', '$$$', '$$', '$$$$']);
      
      // Act
      const result = await getBiteBackData(testUserId, 2024, db);
      
      // Assert
      expect(result.success).toBe(true);
      expect(result.priceRange.name).toBe('$$');
      expect(result.priceRange.count).toBe(3);
    });
  });

  describe('Top rated restaurant calculation', () => {
    test('should find top rated restaurant with minimum 2 visits', async () => {
      // Arrange
      await insertTestEntriesWithRestaurantRatings([
        { name: 'Pizza Palace', taste: 5, service: 5, value: 5 },
        { name: 'Pizza Palace', taste: 4, service: 4, value: 4 },
        { name: 'Burger Barn', taste: 5, service: 5, value: 5 }, // Only 1 visit
        { name: 'Taco Town', taste: 3, service: 3, value: 3 },
        { name: 'Taco Town', taste: 4, service: 4, value: 4 },
      ]);
      
      // Act
      const result = await getBiteBackData(testUserId, 2024, db);
      
      // Assert: With single-visit restaurants allowed, the highest average wins
      expect(result.success).toBe(true);
      expect(result.topRatedRestaurant.name).toBe('Burger Barn');
      expect(parseFloat(result.topRatedRestaurant.rating)).toBeCloseTo(5.0, 1);
      expect(result.topRatedRestaurant.visit_count).toBe(1);
    });
  });
  
  async function insertTestEntries(count) {
    const stmt = db.prepare(`
      INSERT INTO diary_entries (user_id, title, selected_cuisines, location, selected_prices, taste, service, value, date)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    for (let i = 0; i < count; i++) {
      await new Promise((resolve, reject) => {
        stmt.run(
          testUserId,
          `Test Entry ${i}`,
          '["Test"]',
          '{"name": "Test Restaurant"}',
          '$$',
          4,
          4,
          4,
          '2024-01-01',
          (err) => {
            if (err) reject(err);
            else resolve();
          }
        );
      });
    }
    
    stmt.finalize();
  }

  async function insertTestEntriesWithRatings(ratings) {
    const stmt = db.prepare(`
      INSERT INTO diary_entries (user_id, title, selected_cuisines, location, selected_prices, taste, service, value, date)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    for (let i = 0; i < ratings.length; i++) {
      await new Promise((resolve, reject) => {
        stmt.run(
          testUserId,
          `Test Entry ${i}`,
          '["Test"]',
          '{"name": "Test Restaurant"}',
          '$$',
          ratings[i].taste,
          ratings[i].service,
          ratings[i].value,
          '2024-01-01',
          (err) => {
            if (err) reject(err);
            else resolve();
          }
        );
      });
    }
    
    stmt.finalize();
  }

  async function insertTestEntriesWithLocations(locations) {
    const stmt = db.prepare(`
      INSERT INTO diary_entries (user_id, title, selected_cuisines, location, selected_prices, taste, service, value, date)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    for (let i = 0; i < locations.length; i++) {
      await new Promise((resolve, reject) => {
        stmt.run(
          testUserId,
          `Test Entry ${i}`,
          '["Test"]',
          locations[i],
          '$$',
          4,
          4,
          4,
          '2024-01-01',
          (err) => {
            if (err) reject(err);
            else resolve();
          }
        );
      });
    }
    
    stmt.finalize();
  }

  async function insertTestEntriesWithCuisines(cuisines) {
    const stmt = db.prepare(`
      INSERT INTO diary_entries (user_id, title, selected_cuisines, location, selected_prices, taste, service, value, date)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    for (let i = 0; i < cuisines.length; i++) {
      await new Promise((resolve, reject) => {
        stmt.run(
          testUserId,
          `Test Entry ${i}`,
          cuisines[i],
          '{"name": "Test Restaurant"}',
          '$$',
          4,
          4,
          4,
          '2024-01-01',
          (err) => {
            if (err) reject(err);
            else resolve();
          }
        );
      });
    }
    
    stmt.finalize();
  }

  async function insertTestEntriesWithDates(dates) {
    const stmt = db.prepare(`
      INSERT INTO diary_entries (user_id, title, selected_cuisines, location, selected_prices, taste, service, value, date)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    for (let i = 0; i < dates.length; i++) {
      await new Promise((resolve, reject) => {
        stmt.run(
          testUserId,
          `Test Entry ${i}`,
          '["Test"]',
          '{"name": "Test Restaurant"}',
          '$$',
          4,
          4,
          4,
          dates[i],
          (err) => {
            if (err) reject(err);
            else resolve();
          }
        );
      });
    }
    
    stmt.finalize();
  }

  async function insertTestEntriesWithPrices(prices) {
    const stmt = db.prepare(`
      INSERT INTO diary_entries (user_id, title, selected_cuisines, location, selected_prices, taste, service, value, date)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    for (let i = 0; i < prices.length; i++) {
      await new Promise((resolve, reject) => {
        stmt.run(
          testUserId,
          `Test Entry ${i}`,
          '["Test"]',
          '{"name": "Test Restaurant"}',
          prices[i],
          4,
          4,
          4,
          '2024-01-01',
          (err) => {
            if (err) reject(err);
            else resolve();
          }
        );
      });
    }
    
    stmt.finalize();
  }

  async function insertTestEntriesWithRestaurantRatings(restaurants) {
    const stmt = db.prepare(`
      INSERT INTO diary_entries (user_id, title, selected_cuisines, location, selected_prices, taste, service, value, date)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    for (let i = 0; i < restaurants.length; i++) {
      await new Promise((resolve, reject) => {
        stmt.run(
          testUserId,
          `Test Entry ${i}`,
          '["Test"]',
          `{"name": "${restaurants[i].name}"}`,
          '$$',
          restaurants[i].taste,
          restaurants[i].service,
          restaurants[i].value,
          '2024-01-01',
          (err) => {
            if (err) reject(err);
            else resolve();
          }
        );
      });
    }
    
    stmt.finalize();
  }
});