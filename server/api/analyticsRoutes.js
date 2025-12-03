// server/api/analyticsRoutes.js
const express = require('express');
const router = express.Router();
const { verifyUser } = require('./middleware/verifyUser');
const { getAllEntries } = require("../../sqlDB/dbFunctions.js");
const { fetchAll } = require("../../sqlDB/helperFunctions.js");
const getDB = require('../getDB');

// hybrid method of getting/making report
router.get('/biteback/:year', verifyUser, async (req, res) => {
    const { year } = req.params;
    const uid = req.user.uid;
    
    // Validate year input
    const yearNum = parseInt(year);
    const currentYear = new Date().getFullYear();
    
    if (isNaN(yearNum) || yearNum < 2023 || yearNum > currentYear) {
        return res.status(400).json({ 
            error: 'Invalid year. Please provide a year between 2023 and current year.' 
        });
    }
    
    let db;
    try{
        db = getDB(); // Get DB connection

        // ensure cache table exists
        await fetchAll(db, `
            CREATE TABLE IF NOT EXISTS biteback_cache (
            user_id TEXT,
            year INTEGER,
            data TEXT,
            generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (user_id, year)
            )
        `);
        
        // 2. Check for cached data within a day
        const cached = await fetchAll(db, `
            SELECT data, generated_at 
            FROM biteback_cache 
            WHERE user_id = ? AND year = ?
            AND generated_at > datetime('now', '-1 day')
        `, [uid, yearNum]);
        
        if (cached.length > 0) {
            console.log(`✅ Serving cached BiteBack for ${uid} (${year})`);
            return res.json({
                success: true,
                cached: true,
                generatedAt: cached[0].generated_at,
                data: JSON.parse(cached[0].data)
            });
        }
        
        // 3. Generate fresh data if not cached
        console.log(`🔄 Generating fresh BiteBack for ${uid} (${year})`);
        const freshData = await generateBiteBackData(uid, yearNum, db);
        
        // 4. Cache the fresh result for future requests
        try {
            await fetchAll(db, `
                INSERT OR REPLACE INTO biteback_cache (user_id, year, data)
                VALUES (?, ?, ?)
            `, [uid, yearNum, JSON.stringify(freshData)]);
        } catch (cacheError) {
            console.warn('Failed to cache BiteBack data:', cacheError);
            // Continue anyway - prolly shouldn't fail the request
        }
        
        return res.json({
            success: true,
            cached: false,
            data: freshData
        });
        
    } catch (error) {
        console.error('Error in BiteBack endpoint:', error);
        res.status(500).json({ 
            error: 'Failed to generate your BiteBack report',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    } finally {
        // Close the database connection!!
        if (db){
            db.close((err) => {
                if (err) {
                    console.error('Error closing DB connection:', err.message);
                }
            });
        }
    }
});

async function generateBiteBackData(userId, year, db) {
  const startDate = `${year}-01-01`;
  const endDate = `${year}-12-31`;
  const params = [userId, startDate, endDate];
  
  try {
    // Get entries for the year
    const entries = await fetchAll(db, `
        SELECT * FROM diary_entries 
        WHERE user_id = ? 
        AND date BETWEEN ? AND ?
        ORDER BY date DESC
    `, params);
    
    if (entries.length === 0) {
      return { 
        year,
        message: "No entries found for this year",
        hasData: false,
        summary: { totalEntries: 0 }
      };
    }
    
    // Parse JSON fields
    const parsedEntries = entries.map(entry => {
      // Parse JSON strings to objects
      if (entry.selected_cuisines) {
        try {
          entry.selectedCuisines = JSON.parse(entry.selected_cuisines);
        } catch (e) {
          entry.selectedCuisines = [];
        }
      }
      if (entry.selected_labels) {
        try {
          entry.selectedLabels = JSON.parse(entry.selected_labels);
        } catch (e) {
          entry.selectedLabels = [];
        }
      }
      if (entry.images) {
        try {
          entry.images = JSON.parse(entry.images);
        } catch (e) {
          entry.images = [];
        }
      }
      if (entry.location) {
        try {
          entry.location = JSON.parse(entry.location);
        } catch (e) {
          entry.location = {};
        }
      }
      return entry;
    });
    
    // Generate analytics
    const analytics = generateAnalytics(parsedEntries);
    
    return {
      year,
      hasData: true,
      ...analytics
    };
    
  } catch (error) {
    console.error('Error generating BiteBack data:', error);
    throw error;
  }
}

//analytics generation
function generateAnalytics(entries) {
    const analytics = {
        totalEntries: entries.length,
        timePeriod: {
            start: entries[entries.length - 1]?.date,
            end: entries[0]?.date
        }
    };

    // 1. Restaurant Analysis
    const restaurantCounts = {};
    const restaurantRatings = {};
    
    entries.forEach(entry => {
        const restaurant = entry.location?.name || 'Unknown';
        const rating = (entry.taste + entry.service + entry.value) / 3;
        
        // Count visits
        restaurantCounts[restaurant] = (restaurantCounts[restaurant] || 0) + 1;
        
        // Accumulate ratings for average
        if (!restaurantRatings[restaurant]) {
            restaurantRatings[restaurant] = { total: 0, count: 0 };
        }
        restaurantRatings[restaurant].total += rating;
        restaurantRatings[restaurant].count += 1;
    });
    
    analytics.topRestaurants = Object.entries(restaurantCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([name, count]) => ({ 
            name, 
            count,
            avgRating: (restaurantRatings[name].total / restaurantRatings[name].count).toFixed(2)
        }));

    // 2. Cuisine Analysis
    const cuisineCounts = {};
    entries.forEach(entry => {
        const cuisines = entry.selectedCuisines || [];
        cuisines.forEach(cuisine => {
            cuisineCounts[cuisine] = (cuisineCounts[cuisine] || 0) + 1;
        });
    });
    
    analytics.topCuisines = Object.entries(cuisineCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([cuisine, count]) => ({ cuisine, count }));

    // 3. Price Analysis
    const priceCounts = {};
    entries.forEach(entry => {
        const price = entry.selectedPrices || 'Unknown';
        priceCounts[price] = (priceCounts[price] || 0) + 1;
    });
    
    analytics.priceDistribution = Object.entries(priceCounts)
        .sort((a, b) => {
            // Sort by price level: $, $$, $$$, $$$$
            const priceOrder = { '$': 1, '$$': 2, '$$$': 3, '$$$$': 4 };
            return (priceOrder[a[0]] || 5) - (priceOrder[b[0]] || 6);
        })
        .map(([price, count]) => ({ price, count }));

    // 4. Rating Statistics
    const ratingStats = entries.reduce((acc, entry) => {
        const overall = (entry.taste + entry.service + entry.value) / 3;
        acc.total += overall;
        acc.highest = Math.max(acc.highest, overall);
        acc.lowest = Math.min(acc.lowest, overall);
        
        // Count high ratings
        if (overall >= 4) acc.highOverall++;
        if (entry.taste >= 4) acc.highTaste++;
        if (entry.value >= 4) acc.highValue++;
        
        return acc;
    }, { 
        total: 0, 
        highest: 0, 
        lowest: 5, 
        highOverall: 0,
        highTaste: 0,
        highValue: 0 
    });
    
    analytics.ratingStats = {
        averageRating: (ratingStats.total / entries.length).toFixed(2),
        highestRating: ratingStats.highest.toFixed(2),
        lowestRating: ratingStats.lowest.toFixed(2),
        highOverallCount: ratingStats.highOverall,
        highTasteCount: ratingStats.highTaste,
        highValueCount: ratingStats.highValue
    };

    // 5. Label/Tag Analysis
    const labelCounts = {};
    entries.forEach(entry => {
        const labels = entry.selectedLabels || [];
        labels.forEach(label => {
            labelCounts[label] = (labelCounts[label] || 0) + 1;
        });
    });
    
    analytics.topLabels = Object.entries(labelCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 8)
        .map(([label, count]) => ({ label, count }));

    // 6. Monthly Distribution
    const monthlyData = {};
    entries.forEach(entry => {
        const month = new Date(entry.date).toLocaleString('default', { month: 'short' });
        monthlyData[month] = (monthlyData[month] || 0) + 1;
    });
    
    analytics.monthlyDistribution = monthlyData;

    // 7. Best Rated Restaurants (min 2 visits)
    analytics.bestRatedRestaurants = Object.entries(restaurantRatings)
        .filter(([name]) => restaurantRatings[name].count >= 2)
        .map(([name, data]) => ({
            name,
            averageRating: (data.total / data.count).toFixed(2),
            visits: data.count
        }))
        .sort((a, b) => b.averageRating - a.averageRating)
        .slice(0, 3);

    return analytics;
}

// Keep existing wrapped endpoint for backward compatibility
router.get('/wrapped/:year', verifyUser, async (req, res) => {
    const db = getDB();
    try {
        const uid = req.user.uid;
        const { year } = req.params;
        const yearNum = parseInt(year);
        
        // Use the new optimized function for consistency
        const data = await generateBiteBackData(uid, yearNum, db);
        
        // match old response format
        if (!data.hasData) {
            return res.json({ 
                success: true, 
                message: data.message || "No entries found for this period",
                hasData: false 
            });
        }
        
        res.json({ 
            success: true, 
            hasData: true, 
            data: {
                ...data,
                // Keep old property names for compatibility if needed
                totalEntries: data.summary?.totalEntries || 0,
                // ... other mappings
            }
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to generate wrapped analytics" });
    } finally {
        if (db) db.close();
    }
});

module.exports = router;