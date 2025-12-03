// server/api/analyticsRoutes.js
const express = require('express');
const router = express.Router();
const { verifyUser } = require('./middleware/verifyUser');
const { getAllEntries } = require("../../sqlDB/dbFunctions.js");
const { fetchAll } = require("../../sqlDB/helperFunctions.js");
const getDB = require('../getDB');

//i think there is still a chance of connection leaks so im gonna prep for that and also reestablishing a whole new one is annoying
class ConnectionPool {
    constructor(maxConnections = 5) {
        this.maxConnections = maxConnections;
        this.activeConnections = 0;
        this.waitingRequests = [];
    }

    async getConnection() {
        if (this.activeConnections < this.maxConnections) {
            this.activeConnections++;
            return getDB();
        }
        
        return new Promise((resolve) => {
            this.waitingRequests.push(resolve);
        });
    }

    releaseConnection(db) {
        if (db) {
            db.close((err) => {
                if (err) {
                    console.error('Error closing DB connection:', err.message);
                }
            });
        }
        
        this.activeConnections--;
        
        if (this.waitingRequests.length > 0) {
            const nextResolve = this.waitingRequests.shift();
            this.activeConnections++;
            nextResolve(getDB());
        }
    }

    withConnection(callback) {
        return new Promise(async (resolve, reject) => {
            let db;
            try {
                db = await this.getConnection();
                const result = await callback(db);
                resolve(result);
            } catch (error) {
                reject(error);
            } finally {
                if (db) {
                    this.releaseConnection(db);
                }
            }
        });
    }
}

const dbPool = new ConnectionPool(5);

// Helper function 
const executeQuery = async (sql, params = []) => {
    return dbPool.withConnection(async (db) => {
        return await fetchAll(db, sql, params);
    });
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
    const startDate = `${year}-01-01`;
    const endDate = `${year}-12-31`;
    
    try {
        const entries = await executeQuery(`
            SELECT * FROM diary_entries 
            WHERE user_id = ? 
            AND date BETWEEN ? AND ?
            ORDER BY date DESC
        `, [userId, startDate, endDate]);
        
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
function generateAnalytics(entries) {
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
  
  // Calculate top restaurants
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
    
  // Calculate monthly distribution
  const monthlyDistribution = {};
  entries.forEach(entry => {
    if (entry.date) {
      const date = new Date(entry.date);
      const month = date.toLocaleString('default', { month: 'long' });
      monthlyDistribution[month] = (monthlyDistribution[month] || 0) + 1;
    }
  });
  
  return {
    summary: {
      totalEntries,
      averageRating
    },
    ratingStats: {
      averageRating,
      highest: Math.max(...entries.map(e => (e.taste + e.service + e.value) / 3)).toFixed(2),
      lowest: Math.min(...entries.map(e => (e.taste + e.service + e.value) / 3)).toFixed(2)
    },
    topRestaurants,
    bestRatedRestaurants,
    topCuisines,
    monthlyDistribution,
    hasData: true
  };
}

// Keep the existing generateAnalytics function as is
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