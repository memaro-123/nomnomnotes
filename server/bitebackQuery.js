// File: server/biteBackQuery.js; meant to make it easier to generate spotify wrapped knockoff reports for the user's food diary, named BiteBack 
// realized that generating the report live would maybe strain the database since it is a bunch of queries, so perhaps it is better if this is something that happens once a set time period for all users and saves the data into a new 
// that way when the user wants their report, the api endpoint can simply fetch the precalculated data and make it load faster

const { fetchAll, getFirstRow } = require('../sqlDB/dbFunctions');
const getDB = require('./getDB').db;

const extractCityFree = (location) => {
  if (!location) return null;
  
  try {
    const loc = typeof location === 'string' ? JSON.parse(location) : location;
    const address = loc.formatted_address || loc.address || '';
    
    if (!address) return null;
    
    // Common US city patterns
    const patterns = [
      // Format: "123 Main St, Los Angeles, CA 90001"
      /,\s*([^,]+),\s*(?:[A-Z]{2}|California|New York|Texas)\s*\d{5}/i,
      // Format: "Los Angeles, CA"
      /^([^,]+),\s*(?:[A-Z]{2}|California|New York|Texas)/i,
      // Format: "Los Angeles, California"
      /^([^,]+),\s*(?:California|New York|Texas|Florida|Illinois)/i,
      // Format: "in Los Angeles" or "at Los Angeles"
      /(?:in|at)\s+([^,\.]+)/i,
      // Last resort: take second-to-last part of comma-separated address
      (addr) => {
        const parts = addr.split(',').map(p => p.trim());
        return parts.length >= 2 ? parts[parts.length - 2] : null;
      }
    ];
    
    for (const pattern of patterns) {
      if (typeof pattern === 'function') {
        const result = pattern(address);
        if (result) return result;
      } else {
        const match = address.match(pattern);
        if (match && match[1]) {
          const city = match[1].trim();
          // Filter out common non-city words
          if (city && !/^\d+$/.test(city) && city.length > 2) {
            return city;
          }
        }
      }
    }
    
    return null;
  } catch (err) {
    console.error('Error extracting city:', err);
    return null;
  }
};

/**
 * Generates comprehensive "BiteBack" analytics for a user's food diary
 * @param {string} userId - Firebase UID
 * @param {number} year - Year to analyze 
 * @returns {object} analytics
 */
const getBiteBackData = async (userId, year = new Date().getFullYear()) => {
  const db = getDB();
  // Calculate date range for the specified year
  const startDate = `${year}-01-01`;
  const endDate = `${year}-12-31`;
  const params = [userId, startDate, endDate]; 

  try {
    // Execute all analytics queries in parallel
    const [
      basicStats,
      topRestaurants,
      cuisineAnalysis,
      priceAnalysis,
      ratingStats,
      labelAnalysis,
      monthlyTrends,
      bestRated,
      cityAnalysis
    ] = await Promise.all([
      // 1. Basic Statistics
      fetchAll(db, `
        SELECT 
          COUNT(id) as total_entries,
          AVG((taste + service + value) / 3.0) as avg_overall_rating,
          AVG(taste) as avg_taste,
          AVG(service) as avg_service,
          AVG(value) as avg_value
        FROM diary_entries 
        WHERE user_id = ? 
        AND date BETWEEN ? AND ?`,
        params),

      // 2. Top 5 Most Visited Restaurants
      fetchAll(db, `
        SELECT 
          json_extract(location, '$.name') as restaurant_name,
          COUNT(id) as visit_count,
          AVG((taste + service + value) / 3.0) as avg_rating
        FROM diary_entries 
        WHERE user_id = ? 
        AND date BETWEEN ? AND ?
        AND json_extract(location, '$.name') IS NOT NULL
        GROUP BY restaurant_name
        ORDER BY visit_count DESC
        LIMIT 5`,
        params),

      // 3. Cuisine Breakdown
      fetchAll(db, `
        WITH RECURSIVE split(cuisine, rest) AS (
          SELECT '', selected_cuisines || ',' FROM diary_entries 
          WHERE user_id = ? AND date BETWEEN ? AND ?
          UNION ALL
          SELECT 
            substr(rest, 0, instr(rest, ',')),
            substr(rest, instr(rest, ',') + 1)
          FROM split WHERE rest != ''
        )
        SELECT 
          TRIM(REPLACE(REPLACE(cuisine, '[', ''), ']', '')) as cuisine,
          COUNT(*) as count
        FROM split 
        WHERE cuisine != '' AND cuisine NOT LIKE '%null%'
        GROUP BY cuisine
        ORDER BY count DESC
        LIMIT 10`,
        params),

      // 4. Price Range Analysis
      fetchAll(db, `
        SELECT 
          selected_prices as price_range,
          COUNT(id) as count,
          AVG((taste + service + value) / 3.0) as avg_rating
        FROM diary_entries 
        WHERE user_id = ? 
        AND date BETWEEN ? AND ?
        AND selected_prices IS NOT NULL
        GROUP BY selected_prices
        ORDER BY 
          CASE selected_prices
            WHEN '$' THEN 1
            WHEN '$$' THEN 2
            WHEN '$$$' THEN 3
            WHEN '$$$$' THEN 4
            ELSE 5
          END`,
        params),

      // 5. Rating Statistics
      fetchAll(db, `
        SELECT 
          MAX((taste + service + value) / 3.0) as highest_rating,
          MIN((taste + service + value) / 3.0) as lowest_rating,
          COUNT(CASE WHEN taste >= 4 THEN 1 END) as high_taste_count,
          COUNT(CASE WHEN value >= 4 THEN 1 END) as high_value_count
        FROM diary_entries 
        WHERE user_id = ? 
        AND date BETWEEN ? AND ?`,
        params),

      // 6. Most Used Labels/Tags
      fetchAll(db, `
        WITH RECURSIVE split(label, rest) AS (
          SELECT '', selected_labels || ',' FROM diary_entries 
          WHERE user_id = ? AND date BETWEEN ? AND ?
          UNION ALL
          SELECT 
            substr(rest, 0, instr(rest, ',')),
            substr(rest, instr(rest, ',') + 1)
          FROM split WHERE rest != ''
        )
        SELECT 
          TRIM(REPLACE(REPLACE(label, '[', ''), ']', '')) as label,
          COUNT(*) as count
        FROM split 
        WHERE label != '' AND label NOT LIKE '%null%'
        GROUP BY label
        ORDER BY count DESC
        LIMIT 15`,
        params),

      // 7. Monthly Activity Trends
      fetchAll(db, `
        SELECT 
          strftime('%m', date) as month_num,
          strftime('%Y-%m', date) as month,
          COUNT(id) as entry_count
        FROM diary_entries 
        WHERE user_id = ? 
        AND date BETWEEN ? AND ?
        GROUP BY month
        ORDER BY month`,
        params),

      // 8. Best Rated Restaurants (minimum 2 visits)
      fetchAll(db, `
        SELECT 
          json_extract(location, '$.name') as restaurant_name,
          AVG((taste + service + value) / 3.0) as avg_rating,
          COUNT(id) as visit_count
        FROM diary_entries 
        WHERE user_id = ? 
        AND date BETWEEN ? AND ?
        AND json_extract(location, '$.name') IS NOT NULL
        GROUP BY restaurant_name
        HAVING visit_count >= 2
        ORDER BY avg_rating DESC
        LIMIT 5`,
        params),

      // 9. City Analysis (NEW - Most Dined City)
      fetchAll(db, `
        WITH city_counts AS (
          SELECT 
            CASE 
              -- Major US cities pattern matching (FREE - no API calls)
              WHEN location LIKE '%Los Angeles%' OR location LIKE '%LA,%' THEN 'Los Angeles'
              WHEN location LIKE '%New York%' OR location LIKE '%NYC%' OR location LIKE '%Manhattan%' THEN 'New York'
              WHEN location LIKE '%Chicago%' THEN 'Chicago'
              WHEN location LIKE '%San Francisco%' OR location LIKE '%SF,%' THEN 'San Francisco'
              WHEN location LIKE '%Seattle%' THEN 'Seattle'
              WHEN location LIKE '%Miami%' THEN 'Miami'
              WHEN location LIKE '%Boston%' THEN 'Boston'
              WHEN location LIKE '%Austin%' THEN 'Austin'
              WHEN location LIKE '%Portland%' THEN 'Portland'
              WHEN location LIKE '%Denver%' THEN 'Denver'
              WHEN location LIKE '%Las Vegas%' THEN 'Las Vegas'
              WHEN location LIKE '%San Diego%' THEN 'San Diego'
              WHEN location LIKE '%Phoenix%' THEN 'Phoenix'
              WHEN location LIKE '%Dallas%' THEN 'Dallas'
              WHEN location LIKE '%Houston%' THEN 'Houston'
              WHEN location LIKE '%Atlanta%' THEN 'Atlanta'
              WHEN location LIKE '%Philadelphia%' THEN 'Philadelphia'
              WHEN location LIKE '%Washington%' OR location LIKE '%DC%' THEN 'Washington DC'
              WHEN location LIKE '%San Jose%' THEN 'San Jose'
              WHEN location LIKE '%Nashville%' THEN 'Nashville'
              WHEN location LIKE '%Orlando%' THEN 'Orlando'
              WHEN location LIKE '%Minneapolis%' THEN 'Minneapolis'
              WHEN location LIKE '%Salt Lake City%' THEN 'Salt Lake City'
              WHEN location LIKE '%Kansas City%' THEN 'Kansas City'
              WHEN location LIKE '%New Orleans%' THEN 'New Orleans'
              WHEN location LIKE '%Honolulu%' THEN 'Honolulu'
              WHEN location LIKE '%Anchorage%' THEN 'Anchorage'
              -- California cities
              WHEN location LIKE '%Santa Monica%' THEN 'Santa Monica'
              WHEN location LIKE '%Beverly Hills%' THEN 'Beverly Hills'
              WHEN location LIKE '%West Hollywood%' THEN 'West Hollywood'
              WHEN location LIKE '%Pasadena%' THEN 'Pasadena'
              WHEN location LIKE '%Long Beach%' THEN 'Long Beach'
              WHEN location LIKE '%Oakland%' THEN 'Oakland'
              WHEN location LIKE '%Berkeley%' THEN 'Berkeley'
              WHEN location LIKE '%Sacramento%' THEN 'Sacramento'
              WHEN location LIKE '%San Jose%' THEN 'San Jose'
              WHEN location LIKE '%Irvine%' THEN 'Irvine'
              WHEN location LIKE '%Anaheim%' THEN 'Anaheim'
              WHEN location LIKE '%Santa Barbara%' THEN 'Santa Barbara'
              WHEN location LIKE '%San Luis Obispo%' THEN 'San Luis Obispo'
              -- Try to extract city from common address format
              WHEN location LIKE '%, CA%' THEN 
                TRIM(SUBSTR(location, INSTR(location, ',') + 1, INSTR(location, ', CA') - INSTR(location, ',') - 1))
              WHEN location LIKE '%, NY%' THEN 
                TRIM(SUBSTR(location, INSTR(location, ',') + 1, INSTR(location, ', NY') - INSTR(location, ',') - 1))
              WHEN location LIKE '%, TX%' THEN 
                TRIM(SUBSTR(location, INSTR(location, ',') + 1, INSTR(location, ', TX') - INSTR(location, ',') - 1))
              WHEN location LIKE '%, IL%' THEN 
                TRIM(SUBSTR(location, INSTR(location, ',') + 1, INSTR(location, ', IL') - INSTR(location, ',') - 1))
              WHEN location LIKE '%, FL%' THEN 
                TRIM(SUBSTR(location, INSTR(location, ',') + 1, INSTR(location, ', FL') - INSTR(location, ',') - 1))
              WHEN location LIKE '%, WA%' THEN 
                TRIM(SUBSTR(location, INSTR(location, ',') + 1, INSTR(location, ', WA') - INSTR(location, ',') - 1))
              WHEN location LIKE '%, OR%' THEN 
                TRIM(SUBSTR(location, INSTR(location, ',') + 1, INSTR(location, ', OR') - INSTR(location, ',') - 1))
              WHEN location LIKE '%, CO%' THEN 
                TRIM(SUBSTR(location, INSTR(location, ',') + 1, INSTR(location, ', CO') - INSTR(location, ',') - 1))
              WHEN location LIKE '%, NV%' THEN 
                TRIM(SUBSTR(location, INSTR(location, ',') + 1, INSTR(location, ', NV') - INSTR(location, ',') - 1))
              WHEN location LIKE '%, AZ%' THEN 
                TRIM(SUBSTR(location, INSTR(location, ',') + 1, INSTR(location, ', AZ') - INSTR(location, ',') - 1))
              ELSE 'Other'
            END as city,
            id
          FROM diary_entries 
          WHERE user_id = ? 
          AND date BETWEEN ? AND ?
          AND location IS NOT NULL
        )
        SELECT 
          city,
          COUNT(id) as count
        FROM city_counts
        WHERE city != 'Other' AND city IS NOT NULL AND city != ''
        GROUP BY city
        ORDER BY count DESC
        LIMIT 5`,
        params)
    ]);
    
    db.close();
    
    // 10. Post-process city extraction for entries that didn't match patterns
    // This is a fallback that runs in JavaScript (not SQL) for better accuracy
    const allEntries = await fetchAll(db, `
      SELECT location 
      FROM diary_entries 
      WHERE user_id = ? AND date BETWEEN ? AND ?
    `, params);
    
    const cityMap = {};
    allEntries.forEach(entry => {
      const city = extractCityFree(entry.location);
      if (city && city !== 'Other') {
        cityMap[city] = (cityMap[city] || 0) + 1;
      }
    });
    
    // Get top city from JavaScript processing
    let topCity = 'N/A';
    let topCityCount = 0;
    Object.entries(cityMap).forEach(([city, count]) => {
      if (count > topCityCount) {
        topCity = city;
        topCityCount = count;
      }
    });
    
    // Format and structure the response
    return {
      year,
      summary: {
        totalEntries: basicStats[0]?.total_entries || 0,
        averageRating: Number(basicStats[0]?.avg_overall_rating || 0).toFixed(2),
        ratingBreakdown: {
          taste: Number(basicStats[0]?.avg_taste || 0).toFixed(2),
          service: Number(basicStats[0]?.avg_service || 0).toFixed(2),
          value: Number(basicStats[0]?.avg_value || 0).toFixed(2)
        },
        ratingStats: {
          highest: Number(ratingStats[0]?.highest_rating || 0).toFixed(2),
          lowest: Number(ratingStats[0]?.lowest_rating || 0).toFixed(2),
          highTasteCount: ratingStats[0]?.high_taste_count || 0,
          highValueCount: ratingStats[0]?.high_value_count || 0
        }
      },
      restaurants: {
        mostVisited: topRestaurants.map(r => ({
          name: r.restaurant_name,
          visits: r.visit_count,
          avgRating: Number(r.avg_rating || 0).toFixed(2)
        })),
        bestRated: bestRated.map(r => ({
          name: r.restaurant_name,
          avgRating: Number(r.avg_rating || 0).toFixed(2),
          visits: r.visit_count
        }))
      },
      locations: {
        mostDinedCity: {
          name: topCity,
          count: topCityCount,
          // Also include SQL-based cities for comparison
          sqlCities: cityAnalysis.map(c => ({
            city: c.city,
            count: c.count
          })).slice(0, 3) // Top 3 cities from SQL
        },
        mostVisitedRestaurant: topRestaurants.length > 0 ? {
          name: topRestaurants[0].restaurant_name,
          visits: topRestaurants[0].visit_count
        } : null
      },
      categories: {
        topCuisines: cuisineAnalysis.map(c => ({
          cuisine: c.cuisine,
          count: c.count
        })),
        priceDistribution: priceAnalysis.map(p => ({
          priceRange: p.price_range,
          count: p.count,
          avgRating: Number(p.avg_rating || 0).toFixed(2)
        })),
        topLabels: labelAnalysis.map(l => ({
          label: l.label,
          count: l.count
        }))
      },
      trends: {
        monthlyActivity: monthlyTrends.map(m => ({
          month: m.month,
          count: m.entry_count
        })),
        busiestMonth: monthlyTrends.reduce((max, curr) => 
          curr.entry_count > max.entry_count ? curr : max, 
          {entry_count: 0, month: 'None'}
        ).month
      }
    };
  } catch (error) {
    console.error('Error generating BiteBack data:', error);
    throw error;
  }
};

/**
 * Simplified version for the current BiteBack implementation
 * This matches what your analyticsRoutes.js expects
 */
const getBiteBackStats = async (userId, year = null) => {
  const db = getDB();
  
  try {
    const currentYear = year || new Date().getFullYear();
    const yearParam = year ? [year.toString()] : [];
    
    // Get all entries for the user/year
    const allEntries = await fetchAll(db, `
      SELECT location, selected_cuisines, selected_prices, taste, service, value, date
      FROM diary_entries 
      WHERE user_id = ?
      ${year ? `AND strftime('%Y', date) = ?` : ''}
      ORDER BY date DESC
    `, year ? [userId, year.toString()] : [userId]);
    
    if (allEntries.length === 0) {
      return {
        year: currentYear,
        totalEntries: 0,
        mostActiveMonth: { name: 'N/A', entry_count: 0 },
        favoriteCuisine: { name: 'N/A', count: 0 },
        mostDinedCity: { name: 'N/A', count: 0 },
        priceRange: { range: 'N/A', count: 0 },
        mostDinedLocation: { name: 'N/A', visit_count: 0 },
        topRatedRestaurant: { name: 'N/A', rating: 'N/A' }
      };
    }
    
    // Process data in JavaScript (more flexible than SQL for city extraction)
    const cityMap = {};
    const cuisineMap = {};
    const priceMap = {};
    const restaurantMap = {};
    const monthMap = {};
    
    allEntries.forEach(entry => {
      // Extract city
      const city = extractCityFree(entry.location);
      if (city) {
        cityMap[city] = (cityMap[city] || 0) + 1;
      }
      
      // Extract restaurant name
      try {
        const location = typeof entry.location === 'string' ? JSON.parse(entry.location) : entry.location;
        if (location && location.name) {
          restaurantMap[location.name] = (restaurantMap[location.name] || 0) + 1;
        }
      } catch (e) {
        // Ignore parsing errors
      }
      
      // Count cuisines
      try {
        const cuisines = typeof entry.selected_cuisines === 'string' 
          ? JSON.parse(entry.selected_cuisines) 
          : entry.selected_cuisines || [];
        cuisines.forEach(cuisine => {
          cuisineMap[cuisine] = (cuisineMap[cuisine] || 0) + 1;
        });
      } catch (e) {
        // Ignore parsing errors
      }
      
      // Count prices
      if (entry.selected_prices) {
        priceMap[entry.selected_prices] = (priceMap[entry.selected_prices] || 0) + 1;
      }
      
      // Count months
      if (entry.date) {
        const date = new Date(entry.date);
        const month = date.toLocaleString('default', { month: 'long' });
        monthMap[month] = (monthMap[month] || 0) + 1;
      }
    });
    
    // Find most common city
    let topCity = 'N/A';
    let topCityCount = 0;
    Object.entries(cityMap).forEach(([city, count]) => {
      if (count > topCityCount) {
        topCity = city;
        topCityCount = count;
      }
    });
    
    // Find most common cuisine
    let topCuisine = 'N/A';
    let topCuisineCount = 0;
    Object.entries(cuisineMap).forEach(([cuisine, count]) => {
      if (count > topCuisineCount) {
        topCuisine = cuisine;
        topCuisineCount = count;
      }
    });
    
    // Find most common price
    let topPrice = 'N/A';
    let topPriceCount = 0;
    Object.entries(priceMap).forEach(([price, count]) => {
      if (count > topPriceCount) {
        topPrice = price;
        topPriceCount = count;
      }
    });
    
    // Find most active month
    let topMonth = 'N/A';
    let topMonthCount = 0;
    Object.entries(monthMap).forEach(([month, count]) => {
      if (count > topMonthCount) {
        topMonth = month;
        topMonthCount = count;
      }
    });
    
    // Find most visited restaurant
    let topRestaurant = 'N/A';
    let topRestaurantCount = 0;
    Object.entries(restaurantMap).forEach(([restaurant, count]) => {
      if (count > topRestaurantCount) {
        topRestaurant = restaurant;
        topRestaurantCount = count;
      }
    });
    
    // Get top rated restaurant (simplified - just get highest average rating)
    const topRated = await fetchAll(db, `
      SELECT 
        json_extract(location, '$.name') as name,
        AVG((taste + service + value) / 3.0) as rating
      FROM diary_entries 
      WHERE user_id = ?
      ${year ? `AND strftime('%Y', date) = ?` : ''}
      AND json_extract(location, '$.name') IS NOT NULL
      GROUP BY json_extract(location, '$.name')
      ORDER BY rating DESC
      LIMIT 1
    `, year ? [userId, year.toString()] : [userId]);
    
    db.close();
    
    return {
      year: currentYear,
      totalEntries: allEntries.length,
      mostActiveMonth: {
        name: topMonth,
        entry_count: topMonthCount
      },
      favoriteCuisine: {
        name: topCuisine,
        count: topCuisineCount
      },
      mostDinedCity: {
        name: topCity,
        count: topCityCount
      },
      priceRange: {
        range: topPrice,
        count: topPriceCount
      },
      mostDinedLocation: {
        name: topRestaurant,
        visit_count: topRestaurantCount
      },
      topRatedRestaurant: {
        name: topRated[0]?.name || 'N/A',
        rating: topRated[0]?.rating ? topRated[0].rating.toFixed(1) : 'N/A'
      }
    };
    
  } catch (err) {
    console.error("Error in getBiteBackStats:", err);
    db.close();
    throw err;
  }
};

/**
 * Precalculates and stores BiteBack data for all users
 * Should be run periodically (e.g., via cron job at year-end)
 */
const precalculateAllBiteBacks = async () => {
  const currentYear = new Date().getFullYear();
  const db = getDB();
  
  try {
    // Get all users with diary entries this year
    const users = await fetchAll(db, `
      SELECT DISTINCT user_id 
      FROM diary_entries 
      WHERE strftime('%Y', date) = ?
    `, [currentYear.toString()]);
    
    // Create a table for storing precalculated data
    await fetchAll(db, `
      CREATE TABLE IF NOT EXISTS biteback_reports (
        user_id TEXT,
        year INTEGER,
        data TEXT, -- JSON string of the report
        generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (user_id, year)
      )
    `);
    
    // Generate and store reports for each user
    for (const user of users) {
      try {
        const report = await getBiteBackData(user.user_id, currentYear);
        
        await fetchAll(db, `
          INSERT OR REPLACE INTO biteback_reports (user_id, year, data)
          VALUES (?, ?, ?)
        `, [user.user_id, currentYear, JSON.stringify(report)]);
        
        console.log(`Generated BiteBack for user ${user.user_id}`);
      } catch (error) {
        console.error(`Failed to generate BiteBack for user ${user.user_id}:`, error);
      }
    }
    
    console.log('BiteBack precalculation complete!');
  } catch (error) {
    console.error('Error in precalculateAllBiteBacks:', error);
  } finally {
    db.close();
  }
};

module.exports = { getBiteBackData, getBiteBackStats, precalculateAllBiteBacks };