// File: server/biteBackQuery.js; meant to make it easier to generate spotify wrapped knockoff reports for the user's food diary, named BiteBack 
// realized that generating the report live would maybe strain the database since it is a bunch of queries, so perhaps it is better if this is something that happens once a set time period for all users and saves the data into a new 
//  that way when the user wants their report, the api endpoint can simply fetch the precalculated data and make it load faster
const { fetchAll } = require('../sqlDB/helperFunctions');

// File: server/bitebackQuery.js
const { fetchAll } = require('../../sqlDB/helperFunctions.js');

/**
 * Generates comprehensive "BiteBack" analytics for a user's food diary
 * @param {string} userId - Firebase UID
 * @param {number} year - Year to analyze 
 * @returns {object} analytics
 */
const generateBiteBack = async (db, userId, year) => {
  console.log(`Generating BiteBack for user ${userId}, year ${year}`);
  
  // Calculate date range for the specified year
  const startDate = `${year}-01-01`;
  const endDate = `${year}-12-31`;
  
  try {
    // Since our dates are stored as MM/DD/YYYY, we need to handle them differently
    // We'll extract year from the date string in SQLite
    const params = [userId];
    
    // 1. Get all entries for the user first (we'll filter by year in JavaScript)
    const entries = await fetchAll(db, `
      SELECT 
        id,
        title,
        selected_cuisines,
        selected_labels,
        selected_prices,
        location,
        images,
        notes,
        taste,
        service,
        value,
        date,
        strftime('%m', 
          substr(date, 7, 4) || '-' || 
          substr(date, 1, 2) || '-' || 
          substr(date, 4, 2)
        ) as month_num,
        substr(date, 7, 4) as year_str
      FROM diary_entries 
      WHERE user_id = ?
      ORDER BY 
        substr(date, 7, 4) DESC,
        substr(date, 1, 2) DESC,
        substr(date, 4, 2) DESC
    `, params);

    // Filter entries for the requested year
    const filteredEntries = entries.filter(entry => {
      if (!entry.year_str) return false;
      return parseInt(entry.year_str) === year;
    });

    if (filteredEntries.length === 0) {
      return {
        year,
        hasData: false,
        message: `No entries found for ${year}. Start documenting your food adventures!`
      };
    }

    // Parse JSON fields
    const parsedEntries = filteredEntries.map(entry => {
      const parsedEntry = { ...entry };
      
      // Parse JSON strings to objects
      try {
        parsedEntry.selectedCuisines = JSON.parse(entry.selected_cuisines || '[]');
        parsedEntry.selectedLabels = JSON.parse(entry.selected_labels || '[]');
        parsedEntry.images = JSON.parse(entry.images || '[]');
        parsedEntry.location = JSON.parse(entry.location || '{}');
      } catch (e) {
        parsedEntry.selectedCuisines = [];
        parsedEntry.selectedLabels = [];
        parsedEntry.images = [];
        parsedEntry.location = {};
      }
      
      return parsedEntry;
    });

    // Calculate basic statistics
    const totalEntries = parsedEntries.length;
    const totalRating = parsedEntries.reduce((sum, e) => sum + (e.taste + e.service + e.value) / 3, 0);
    const averageRating = (totalRating / totalEntries).toFixed(2);
    
    // Calculate individual averages
    const avgTaste = (parsedEntries.reduce((sum, e) => sum + e.taste, 0) / totalEntries).toFixed(2);
    const avgService = (parsedEntries.reduce((sum, e) => sum + e.service, 0) / totalEntries).toFixed(2);
    const avgValue = (parsedEntries.reduce((sum, e) => sum + e.value, 0) / totalEntries).toFixed(2);
    
    // Group by restaurant
    const restaurantMap = {};
    parsedEntries.forEach(entry => {
      const name = entry.location?.name || 'Unknown Restaurant';
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
      
    // Calculate best rated restaurants (minimum 2 visits)
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
    parsedEntries.forEach(entry => {
      entry.selectedCuisines.forEach(cuisine => {
        cuisineCount[cuisine] = (cuisineCount[cuisine] || 0) + 1;
      });
    });
    
    const topCuisines = Object.entries(cuisineCount)
      .map(([cuisine, count]) => ({ cuisine, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
    
    // Calculate price distribution
    const priceDistribution = {};
    parsedEntries.forEach(entry => {
      const price = entry.selected_prices || 'Not specified';
      priceDistribution[price] = (priceDistribution[price] || 0) + 1;
    });
    
    // Calculate label distribution
    const labelCount = {};
    parsedEntries.forEach(entry => {
      entry.selectedLabels.forEach(label => {
        labelCount[label] = (labelCount[label] || 0) + 1;
      });
    });
    
    const topLabels = Object.entries(labelCount)
      .map(([label, count]) => ({ label, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
    
    // Calculate monthly distribution
    const monthlyDistribution = {};
    parsedEntries.forEach(entry => {
      if (entry.month_num) {
        const monthNames = [
          'January', 'February', 'March', 'April', 'May', 'June',
          'July', 'August', 'September', 'October', 'November', 'December'
        ];
        const monthName = monthNames[parseInt(entry.month_num) - 1] || 'Unknown';
        monthlyDistribution[monthName] = (monthlyDistribution[monthName] || 0) + 1;
      }
    });
    
    // Calculate busiest month
    const busiestMonth = Object.entries(monthlyDistribution)
      .reduce((max, [month, count]) => count > max.count ? { month, count } : max, 
              { month: 'None', count: 0 }).month;
    
    // Find highest and lowest rated entries
    const allRatings = parsedEntries.map(e => (e.taste + e.service + e.value) / 3);
    const highestRating = Math.max(...allRatings).toFixed(2);
    const lowestRating = Math.min(...allRatings).toFixed(2);
    
    // Find entries with high ratings
    const highTasteCount = parsedEntries.filter(e => e.taste >= 4).length;
    const highValueCount = parsedEntries.filter(e => e.value >= 4).length;
    
    return {
      year,
      hasData: true,
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
        lowest: lowestRating,
        highTasteCount,
        highValueCount
      },
      topRestaurants,
      bestRatedRestaurants,
      topCuisines,
      priceDistribution,
      topLabels,
      monthlyDistribution,
      busiestMonth,
      entries: parsedEntries
    };
    
  } catch (error) {
    console.error('Error generating BiteBack data:', error);
    throw error;
  }
};

module.exports = { generateBiteBack };