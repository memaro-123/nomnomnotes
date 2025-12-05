const sqlite3 = require('sqlite3').verbose();
const {fetchAll} = require('../sqlDB/helperFunctions');

const extractCity= (location) => {
  if (!location) return null;
  
  try {
    const loc = typeof location === 'string' ? JSON.parse(location) : location;
    const address = loc.formatted_address || loc.address || loc.name || '';
    
    if (!address) return null;
    // Common patterns for city extraction
    // I USED AI FOR THIS PART BECAUSE IT IS A LOT OF USELESS TYPING
    const patterns = [
      // US format: "123 Main St, Los Angeles, CA 90001"
      /,\s*([^,]+?)\s*,\s*(?:[A-Z]{2}|California|New York|Texas|Florida|Illinois|Pennsylvania|Ohio|Georgia|Michigan|North Carolina|Virginia|Washington|Massachusetts|Indiana|Arizona|Tennessee|Missouri|Maryland|Wisconsin|Minnesota|Colorado|Alabama|South Carolina|Louisiana|Kentucky|Oregon|Oklahoma|Connecticut|Iowa|Mississippi|Arkansas|Kansas|Utah|Nevada|New Mexico|West Virginia|Nebraska|Idaho|Hawaii|Maine|New Hampshire|Rhode Island|Montana|Delaware|South Dakota|Alaska|North Dakota|Vermont|Wyoming)\s*\d{5}/i,
      
      // International format: "123 Main St, Los Angeles, California 90001"
      /,\s*([^,]+?)\s*,\s*(?:California|New York|Texas|Florida|Illinois|Pennsylvania|Ohio|Georgia|Michigan|North Carolina|Virginia|Washington|Massachusetts|Indiana|Arizona|Tennessee|Missouri|Maryland|Wisconsin|Minnesota|Colorado|Alabama|South Carolina|Louisiana|Kentucky|Oregon|Oklahoma|Connecticut|Iowa|Mississippi|Arkansas|Kansas|Utah|Nevada|New Mexico|West Virginia|Nebraska|Idaho|Hawaii|Maine|New Hampshire|Rhode Island|Montana|Delaware|South Dakota|Alaska|North Dakota|Vermont|Wyoming)\s*\d{5}/i,
      
      // Major cities by name (direct match)
      (addr) => {
        const majorCities = [
          // US Cities
          'Los Angeles', 'New York', 'Chicago', 'San Francisco', 'Seattle',
          'Miami', 'Boston', 'Austin', 'Portland', 'Denver', 'Las Vegas',
          'San Diego', 'Phoenix', 'Dallas', 'Houston', 'Atlanta',
          'Philadelphia', 'Washington', 'San Jose', 'Nashville', 'Orlando',
          'Detroit', 'Baltimore', 'Memphis', 'Milwaukee', 'Albuquerque',
          'Tucson', 'Fresno', 'Sacramento', 'Kansas City', 'Mesa',
          'Colorado Springs', 'Omaha', 'Raleigh', 'Long Beach', 'Virginia Beach',
          'Oakland', 'Minneapolis', 'Tulsa', 'Arlington', 'Tampa',
          
          // California cities
          'Santa Monica', 'Beverly Hills', 'West Hollywood', 'Pasadena',
          'Long Beach', 'Berkeley', 'Irvine', 'Anaheim', 'Santa Barbara',
          'San Luis Obispo', 'Malibu', 'Sacramento', 'San Jose', 'Fremont',
          'Irvine', 'Modesto', 'Fontana', 'Oxnard', 'Moreno Valley',
          'Glendale', 'Huntington Beach', 'Santa Clarita', 'Garden Grove',
          'Oceanside', 'Rancho Cucamonga', 'Santa Rosa', 'Ontario', 'Elk Grove',
          'Corona', 'Lancaster', 'Palmdale', 'Salinas', 'Hayward', 'Pomona',
          'Escondido', 'Sunnyvale', 'Torrance', 'Orange', 'Fullerton',
          'Pasadena', 'Thousand Oaks', 'Visalia', 'Simi Valley', 'Concord',
          'Roseville', 'Victorville', 'Santa Clara', 'Vallejo', 'Berkeley'
        ];
        
        for (const city of majorCities) {
          if (addr.includes(city)) return city;
        }
        return null;
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
          if (city && !/^\d+$/.test(city) && city.length > 2 &&
              !/^(st|street|ave|avenue|blvd|boulevard|dr|drive|rd|road|ln|lane|way|ct|court|pl|place)$/i.test(city)) {
            return city;
          }
        }
      }
    }
    // Last resort: take the second-to-last comma-separated part
    const parts = address.split(',').map(p => p.trim());
    if (parts.length >= 3) {
      // Usually format is: Street, City, State ZIP
      const potentialCity = parts[parts.length - 2];
      if (potentialCity && potentialCity.length > 2 && !/^\d+$/.test(potentialCity)) {
        return potentialCity;
      }
    }
    
    return null;
  } catch (err) {
    console.error('Error extracting city:', err);
    return null;
  }
};

//helper to find most common in map
const findMostCommon = (map) => {
  let mostCommon = 'N/A';
  let highestCount = 0;
  
  Object.entries(map).forEach(([key, count]) => {
    if (count > highestCount) {
      mostCommon = key;
      highestCount = count;
    }
  });
  
  return { name: mostCommon, count: highestCount };
};

/**
 * Generates comprehensive "BiteBack" analytics for a user's food diary
 * @param {string} userId - Firebase UID
 * @param {number} year - Year to analyze 
 * @returns {object} analytics
 */
const getBiteBackData = async (userId, year = null, dbArg = null) => {
  const createdDb = !dbArg;
  const db = dbArg || new sqlite3.Database("my.db");

  try{
    const currentYear = year || new Date().getFullYear();
    const yearParam = year ? year.toString() : null;

    //check for min 5
    const minEntriesQuery = `
      SELECT COUNT(*) as entry_count
      FROM diary_entries
      WHERE user_id = ?
      ${yearParam ? `AND strftime('%Y', date) = ?` : ''}`;

    const minEntriesParams = yearParam ? [userId, yearParam] : [userId];
    const entryCountResult = await fetchAll(db, minEntriesQuery, minEntriesParams);
    const totalEntries = entryCountResult[0]?.entry_count || 0;
    console.log('BiteBack: entryCountResult=', entryCountResult, 'totalEntries=', totalEntries);
    
    // If less than 5 entries, return failure 
    if (totalEntries < 5) {
      return {
        success: false,
        message: "Need at least 5 diary entries to generate BiteBack",
        totalEntries,
        requiredEntries: 5
      };
    }

    const allEntriesQuery = `
      SELECT location, selected_cuisines, selected_prices, taste, service, value, date
      FROM diary_entries 
      WHERE user_id = ?
      ${yearParam ? `AND strftime('%Y', date) = ?` : ''}`;

    const allEntries = await fetchAll(db, allEntriesQuery, minEntriesParams);
    console.log('BiteBack: fetched allEntries count =', Array.isArray(allEntries) ? allEntries.length : typeof allEntries);

    const ratingStatsQuery = `
      SELECT 
        AVG((taste + service + value) / 3.0) as avg_overall_rating,
        AVG(taste) as avg_taste,
        AVG(service) as avg_service,
        AVG(value) as avg_value
      FROM diary_entries 
      WHERE user_id = ?
      ${yearParam ? `AND strftime('%Y', date) = ?` : ''}`;
    
    const ratingStats = await fetchAll(db, ratingStatsQuery, minEntriesParams);

    const cityMap = {};
    const cuisineMap = {};
    const priceMap = {};
    const restaurantMap = {};
    const monthMap = {};
    
    allEntries.forEach(entry => {
      // City extraction
      const city = extractCity(entry.location);
      if (city) {
        cityMap[city] = (cityMap[city] || 0) + 1;
      }

      // count restaurants
      try {
        const location = typeof entry.location === 'string' ? JSON.parse(entry.location) : entry.location;
        if (location?.name) {
          restaurantMap[location.name] = (restaurantMap[location.name] || 0) + 1;
        }
      } catch (e) {
        // Ignore errors
      }

      // Count cuisines (selected_cuisines stored as JSON array strings)
      if (entry.selected_cuisines) {
        try {
          const cuisines = typeof entry.selected_cuisines === 'string' ? JSON.parse(entry.selected_cuisines) : entry.selected_cuisines;
          if (Array.isArray(cuisines)) {
            cuisines.forEach(c => {
              cuisineMap[c] = (cuisineMap[c] || 0) + 1;
            });
          }
        } catch (e) {
          // ignore JSON parse errors
        }
      }

      //count prices
      // Count prices
      if (entry.selected_prices) {
        priceMap[entry.selected_prices] = (priceMap[entry.selected_prices] || 0) + 1;
      }
      
      // Count months
      if (entry.date) {
        try {
          const date = new Date(entry.date);
          const month = date.toLocaleString('default', { month: 'long' });
          monthMap[month] = (monthMap[month] || 0) + 1;
        } catch (e) {
          // Ignore date errors
        }
      }
    });

    // Get top rated restaurant (minimum 1 visits, i want highest rated)
    const topRatedQuery = `
      SELECT 
        json_extract(location, '$.name') as name,
        AVG((taste + service + value) / 3.0) as rating,
        COUNT(id) as visit_count
      FROM diary_entries 
      WHERE user_id = ?
      ${yearParam ? `AND strftime('%Y', date) = ?` : ''}
      AND json_extract(location, '$.name') IS NOT NULL
      AND json_extract(location, '$.name') != ''
      AND taste > 0 AND service > 0 AND value > 0
      GROUP BY json_extract(location, '$.name')
      HAVING visit_count >= 1  -- Changed from 2 to 1 to include all restaurants
      ORDER BY rating DESC
      LIMIT 1
    `;
    
    let topRated = [];
    try {
      topRated = await fetchAll(db, topRatedQuery, minEntriesParams);
    } catch (e) {
      // If JSON is malformed in some rows, json_extract in SQL can throw.
      // Fall back to empty result and continue — we still want overall analytics.
      console.warn('Top rated restaurant query failed (possibly malformed JSON).', e && e.message);
      topRated = [];
    }

    const topCity = findMostCommon(cityMap);
    /*console.log('BiteBack: cityMap =', JSON.stringify(cityMap));
    // If all cities are unique (highest count === 1) tests expect the count
    // to reflect the number of parsed city entries (i.e. total parsed count)
    if (topCity.count === 1) {
      const totalParsed = Object.values(cityMap).reduce((s, v) => s + v, 0);
      topCity.count = totalParsed;
    }*/
    const topCuisine = findMostCommon(cuisineMap);
    const topPrice = findMostCommon(priceMap);
    const topMonth = findMostCommon(monthMap);
    const topRestaurant = findMostCommon(restaurantMap);
    
    if (createdDb) db.close();
    
    // If SQL topRated failed or returned empty, compute a JS fallback using parsed locations
    let topRatedResult = topRated;
    if ((!topRatedResult || topRatedResult.length === 0) && allEntries && allEntries.length > 0) {
      // Build map of restaurants -> {sumRating, count}
      const rmap = {};
      allEntries.forEach(entry => {
        try {
          const loc = typeof entry.location === 'string' ? JSON.parse(entry.location) : entry.location;
          const name = loc?.name;
          if (!name) return;
          const rating = ((Number(entry.taste) || 0) + (Number(entry.service) || 0) + (Number(entry.value) || 0)) / 3.0;
          if (!rmap[name]) rmap[name] = { sum: 0, count: 0 };
          rmap[name].sum += rating;
          rmap[name].count += 1;
        } catch (e) {
          // ignore parse errors
        }
      });

      // Take restaurants (allow single-visit restaurants as well) and compute avg
      const candidates = Object.entries(rmap)
        .map(([name, { sum, count }]) => ({ name, avg: sum / count, count }))
        // allow restaurants with a single visit
        .filter(r => r.count >= 1)
        .sort((a, b) => b.avg - a.avg);

      console.log('BiteBack: topRatedFallback candidates =', JSON.stringify(candidates));

      if (candidates.length > 0) {
        topRatedResult = [{ name: candidates[0].name, rating: candidates[0].avg, visit_count: candidates[0].count }];
      }
    }

    return {
      success: true,
      year: currentYear,
      totalEntries,
      favoriteCuisine: topCuisine,
      mostDinedCity: topCity,
      priceRange: topPrice,
      mostActiveMonth: topMonth,
      topRatedRestaurant: {
        name: topRatedResult?.[0]?.name || 'N/A',
        rating: topRatedResult?.[0]?.rating ? Number(topRatedResult[0].rating).toFixed(1) : 'N/A'
      },
      averageRating: {
        overall: ratingStats[0]?.avg_overall_rating ? ratingStats[0].avg_overall_rating.toFixed(2) : 'N/A',
        taste: ratingStats[0]?.avg_taste ? ratingStats[0].avg_taste.toFixed(2) : 'N/A',
        service: ratingStats[0]?.avg_service ? ratingStats[0].avg_service.toFixed(2) : 'N/A',
        value: ratingStats[0]?.avg_value ? ratingStats[0].avg_value.toFixed(2) : 'N/A'
      }
    };
    
  } catch (err) {
    console.error("Error in bitebackQuery:", err);
    if (createdDb) db.close();
    throw err;
  }
};

module.exports = { getBiteBackData, extractCity, findMostCommon };
