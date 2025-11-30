// server/api/analyticsRoutes.js
const express = require('express');
const router = express.Router();
const { verifyUser } = require('./middleware/verifyUser');
const { getAllEntries } = require("../../sqlDB/dbFunctions.js");

router.get('/wrapped/:year', verifyUser, async (req, res) => {
  try {
    const uid = req.user.uid;
    const { year } = req.params;
    const allEntries = await getAllEntries(uid);
    
    // Filter entries for the specified year
    const yearEntries = allEntries.filter(entry => {
      const entryYear = new Date(entry.date).getFullYear();
      return entryYear === parseInt(year);
    });

    if (yearEntries.length === 0) {
      return res.json({ 
        success: true, 
        message: "No entries found for this period",
        hasData: false 
      });
    }

    const analytics = generateWrappedAnalytics(yearEntries);
    res.json({ success: true, hasData: true, data: analytics });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to generate wrapped analytics" });
  }
});

function generateWrappedAnalytics(entries) {
  const analytics = {
    totalEntries: entries.length,
    timePeriod: {
      start: entries[entries.length - 1]?.date,
      end: entries[0]?.date
    }
  };

  // Most visited restaurant
  const restaurantCounts = {};
  entries.forEach(entry => {
    const restaurant = entry.location?.name || 'Unknown';
    restaurantCounts[restaurant] = (restaurantCounts[restaurant] || 0) + 1;
  });
  analytics.topRestaurants = Object.entries(restaurantCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name, count]) => ({ name, count }));

  // Favorite cuisine analysis
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

  // Price range analysis
  const priceCounts = {};
  entries.forEach(entry => {
    const price = entry.selectedPrices || 'Unknown';
    priceCounts[price] = (priceCounts[price] || 0) + 1;
  });
  analytics.priceDistribution = Object.entries(priceCounts)
    .sort((a, b) => b[1] - a[1])
    .map(([price, count]) => ({ price, count }));

  // Rating analysis
  const avgRatings = entries.reduce((acc, entry) => {
    const overall = (entry.taste + entry.service + entry.value) / 3;
    acc.total += overall;
    acc.highest = Math.max(acc.highest, overall);
    return acc;
  }, { total: 0, highest: 0 });
  
  analytics.ratingStats = {
    averageRating: (avgRatings.total / entries.length).toFixed(2),
    highestRatedEntry: avgRatings.highest.toFixed(2),
    totalRatingsGiven: entries.length
  };

  // Most used labels/tags
  const labelCounts = {};
  entries.forEach(entry => {
    const labels = entry.selectedLabels || [];
    labels.forEach(label => {
      labelCounts[label] = (labelCounts[label] || 0) + 1;
    });
  });
  analytics.topLabels = Object.entries(labelCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([label, count]) => ({ label, count }));

  // Monthly distribution
  const monthlyData = {};
  entries.forEach(entry => {
    const month = new Date(entry.date).toLocaleString('default', { month: 'long' });
    monthlyData[month] = (monthlyData[month] || 0) + 1;
  });
  analytics.monthlyDistribution = monthlyData;

  // Best rated restaurant (min 2 visits)
  const restaurantRatings = {};
  const restaurantVisits = {};
  
  entries.forEach(entry => {
    const restaurant = entry.location?.name || 'Unknown';
    const rating = (entry.taste + entry.service + entry.value) / 3;
    
    if (!restaurantRatings[restaurant]) {
      restaurantRatings[restaurant] = 0;
      restaurantVisits[restaurant] = 0;
    }
    
    restaurantRatings[restaurant] += rating;
    restaurantVisits[restaurant]++;
  });

  analytics.bestRatedRestaurants = Object.entries(restaurantRatings)
    .filter(([restaurant]) => restaurantVisits[restaurant] >= 2)
    .map(([restaurant, totalRating]) => ({
      restaurant,
      averageRating: (totalRating / restaurantVisits[restaurant]).toFixed(2),
      visits: restaurantVisits[restaurant]
    }))
    .sort((a, b) => b.averageRating - a.averageRating)
    .slice(0, 3);

  return analytics;
}

module.exports = router;