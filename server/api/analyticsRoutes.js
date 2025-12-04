// server/api/analyticsRoutes.js
const express = require('express');
const router = express.Router();
const { verifyUser } = require('./middleware/verifyUser');
const { fetchAll } = require("../../sqlDB/helperFunctions.js");
const getDB = require('../getDB');
const { generateBiteBack } = require("../bitebackQuery");
const { getAllEntries } = require("../../sqlDB/dbFunctions.js");

// Helper function without connection pool
const executeQuery = async (sql, params = []) => {
  const db = getDB();
  try {
    const result = await fetchAll(db, sql, params);
    return result;
  } finally {
    db.close();
  }
};

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
    
    try {
        // ensure cache table exists
        await executeQuery(`
            CREATE TABLE IF NOT EXISTS biteback_cache (
                user_id TEXT,
                year INTEGER,
                data TEXT,
                generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                PRIMARY KEY (user_id, year)
            )
        `);
        
        // 2. Check for cached data within a day
        const cached = await executeQuery(`
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
        const freshData = await generateBiteBackData(uid, yearNum);
        
        // 4. Cache the fresh result for future requests
        try {
            await executeQuery(`
                INSERT OR REPLACE INTO biteback_cache (user_id, year, data)
                VALUES (?, ?, ?)
            `, [uid, yearNum, JSON.stringify(freshData)]);
        } catch (cacheError) {
            console.warn('Failed to cache BiteBack data:', cacheError);
            // Continue anyway - shouldn't fail the request
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
    }
});

async function generateBiteBackData(userId, year) {
    console.log(`🔄 generateBiteBackData for user: ${userId}, year: ${year}`);
    
    try {
        // Debug: Check what entries we have
        const allEntries = await executeQuery(`
            SELECT id, date, title FROM diary_entries 
            WHERE user_id = ?
            ORDER BY date DESC
            LIMIT 5
        `, [userId]);
        
        console.log(`📊 Found ${allEntries.length} total entries for user`);
        allEntries.forEach((entry, i) => {
            console.log(`  ${i+1}. Date: "${entry.date}", Title: "${entry.title}"`);
        });
        
        if (allEntries.length === 0) {
            console.log(`❌ No entries found`);
            return { 
                year,
                message: "No diary entries found. Create your first entry!",
                hasData: false,
                summary: { totalEntries: 0 }
            };
        }
        
        // Since dates are MM/DD/YYYY, we can't use SQL BETWEEN with YYYY-MM-DD
        // Instead, get ALL entries and filter by year in JavaScript
        const entries = await executeQuery(`
            SELECT * FROM diary_entries 
            WHERE user_id = ?
            ORDER BY date DESC
        `, [userId]);
        
        // Filter entries for the requested year (MM/DD/YYYY format)
        const filteredEntries = entries.filter(entry => {
            if (!entry.date) return false;
            
            try {
                // Parse MM/DD/YYYY format
                const [month, day, entryYear] = entry.date.split('/');
                const matches = parseInt(entryYear) === year;
                
                if (matches) {
                    console.log(`✅ Entry matches ${year}: "${entry.date}" - ${entry.title}`);
                }
                return matches;
                
            } catch (e) {
                console.error(`❌ Error parsing date "${entry.date}":`, e);
                return false;
            }
        });
        
        console.log(`✅ After filtering: ${filteredEntries.length} entries for ${year}`);
        
        if (filteredEntries.length === 0) {
            // Find what years we DO have entries for
            const availableYears = entries
                .map(entry => {
                    if (!entry.date) return null;
                    try {
                        const [month, day, entryYear] = entry.date.split('/');
                        return parseInt(entryYear);
                    } catch (e) {
                        return null;
                    }
                })
                .filter(year => year !== null)
                .filter((year, index, self) => self.indexOf(year) === index) // Unique
                .sort((a, b) => b - a); // Descending
            
            console.log(`📅 Available years: ${availableYears.join(', ')}`);
            
            return { 
                year,
                message: `No entries found for ${year}. Try ${availableYears.length > 0 ? availableYears[0] : 'creating new entries'}.`,
                hasData: false,
                summary: { totalEntries: 0 }
            };
        }
        
        // Parse JSON fields
        const parsedEntries = filteredEntries.map(entry => {
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
        
        const analytics = generateAnalytics(parsedEntries, year);
        
        console.log(`🎉 Success! Generated BiteBack for ${year} with ${analytics.summary.totalEntries} entries`);
        
        return {
            year,
            hasData: true,
            ...analytics
        };
        
    } catch (error) {
        console.error('❌ Error generating BiteBack data:', error);
        throw error;
    }
}

function generateAnalytics(entries, year) {
  if (!entries || entries.length === 0) {
    return {
      summary: { totalEntries: 0 },
      hasData: false
    };
  }
  
  // Calculate total entries
  const totalEntries = entries.length;
  
  // Calculate average ratings
  const totalTaste = entries.reduce((sum, e) => sum + (e.taste || 0), 0);
  const totalService = entries.reduce((sum, e) => sum + (e.service || 0), 0);
  const totalValue = entries.reduce((sum, e) => sum + (e.value || 0), 0);
  const averageRating = ((totalTaste + totalService + totalValue) / (3 * totalEntries)).toFixed(2);
  
  // Calculate individual averages for display
  const avgTaste = (totalTaste / totalEntries).toFixed(2);
  const avgService = (totalService / totalEntries).toFixed(2);
  const avgValue = (totalValue / totalEntries).toFixed(2);
  
  // Get highest and lowest ratings
  const allRatings = entries.map(e => (e.taste + e.service + e.value) / 3);
  const highestRating = Math.max(...allRatings).toFixed(2);
  const lowestRating = Math.min(...allRatings).toFixed(2);
  
  // Group by restaurant
  const restaurantMap = {};
  entries.forEach(entry => {
    const name = entry.location?.name || 'Unknown';
    if (!restaurantMap[name]) {
      restaurantMap[name] = {
        count: 0,
        totalRating: 0,
        entries: []
      };
    }
    restaurantMap[name].count++;
    restaurantMap[name].totalRating += (entry.taste + entry.service + entry.value) / 3;
    restaurantMap[name].entries.push(entry);
  });
  
  // Calculate top restaurants by visit count
  const topRestaurants = Object.entries(restaurantMap)
    .map(([name, data]) => ({
      name,
      count: data.count,
      avgRating: (data.totalRating / data.count).toFixed(2)
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);
    
  // Calculate best rated restaurants (min 2 visits)
  const bestRatedRestaurants = Object.entries(restaurantMap)
    .filter(([_, data]) => data.count >= 2)
    .map(([name, data]) => ({
      name,
      visits: data.count,
      averageRating: (data.totalRating / data.count).toFixed(2)
    }))
    .sort((a, b) => b.averageRating - a.averageRating)
    .slice(0, 5);
    
  // Calculate cuisine distribution
  const cuisineCount = {};
  entries.forEach(entry => {
    const cuisines = entry.selectedCuisines || [];
    cuisines.forEach(cuisine => {
      cuisineCount[cuisine] = (cuisineCount[cuisine] || 0) + 1;
    });
  });
  
  const topCuisines = Object.entries(cuisineCount)
    .map(([cuisine, count]) => ({ cuisine, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);
    
  // Calculate price distribution
  const priceDistribution = {};
  entries.forEach(entry => {
    const price = entry.selected_prices || 'Unknown';
    priceDistribution[price] = (priceDistribution[price] || 0) + 1;
  });
  
  // Calculate label distribution
  const labelCount = {};
  entries.forEach(entry => {
    const labels = entry.selectedLabels || [];
    labels.forEach(label => {
      labelCount[label] = (labelCount[label] || 0) + 1;
    });
  });
  
  const topLabels = Object.entries(labelCount)
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);
    
  // Calculate monthly distribution (MM/DD/YYYY format)
  const monthlyDistribution = {};
  entries.forEach(entry => {
    if (entry.date) {
      try {
        // Parse MM/DD/YYYY format
        const [month, day, year] = entry.date.split('/');
        const monthNumber = parseInt(month);
        const monthNames = [
          'January', 'February', 'March', 'April', 'May', 'June',
          'July', 'August', 'September', 'October', 'November', 'December'
        ];
        const monthName = monthNames[monthNumber - 1] || 'Unknown';
        monthlyDistribution[monthName] = (monthlyDistribution[monthName] || 0) + 1;
      } catch (e) {
        console.error('Error parsing date:', entry.date, e);
      }
    }
  });
  
  // busiest month calc
  const busiestMonth = Object.entries(monthlyDistribution)
    .reduce((max, [month, count]) => count > max.count ? { month, count } : max, 
            { month: 'None', count: 0 }).month;
  
  return {
    summary: {
      totalEntries,
      averageRating
    },
    ratingStats: {
      averageRating,
      taste: avgTaste,
      service: avgService,
      value: avgValue,
      highest: highestRating,
      lowest: lowestRating
    },
    topRestaurants,
    bestRatedRestaurants,
    topCuisines,
    priceDistribution,
    topLabels,
    monthlyDistribution,
    busiestMonth,
    hasData: true
  };
}

// Keep existing wrapped endpoint for backward compatibility
router.get('/wrapped/:year', verifyUser, async (req, res) => {
    try {
        const uid = req.user.uid;
        const { year } = req.params;
        const yearNum = parseInt(year);
        
        // Use the new function for consistency
        const data = await generateBiteBackData(uid, yearNum);
        
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
                // Keep old names for compatibility if needed
                totalEntries: data.summary?.totalEntries || 0,
            }
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to generate wrapped analytics" });
    }
});

module.exports = router;