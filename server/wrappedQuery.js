// File: server/wrappedQuery.js; meant to make it easier to generate spotify wrapped knockoff reports for the user's food diary, named BiteBack
// realized that generating the report live would maybe strain the database since it is a bunch of queries, so perhaps it is better if this is something that happens once a set time period for all users and saves the data into a new 
// that way when the user wants their report, the api endpoint can simply fetch the precalculated data and make it load faster

const { fetchAll } = require('../sqlDB/dbUtils');
const db = require('../sqlDB/index').db; // Load the database connection

/**
 * Runs parallel SQL queries to aggregate a user's diary data over the last year.
 * @param {string} userId - The Firebase UID of the user.
 * @returns {object} The aggregated analytics data.
 */
const getWrappedData = async (userId) => {
    // 1. Define the Time Filter (Last 365 Days)
    const oneYearAgo = Date.now() - (365 * 24 * 60 * 60 * 1000);
    const params = [userId, oneYearAgo];

    // 2. Define All Aggregation Queries
    const queries = [
        // a. Total Entries
        fetchAll(db, `SELECT COUNT(entry_id) AS total_entries FROM diary_entries WHERE user_id = ? AND created_at >= ?;`, params),
        
        // b. Top Restaurant/Location
        fetchAll(db, `SELECT location, COUNT(entry_id) AS total_visits FROM diary_entries WHERE user_id = ? AND created_at >= ? GROUP BY location ORDER BY total_visits DESC LIMIT 1;`, params),
        
        // c. Favorite Cuisine
        fetchAll(db, `SELECT cuisine, COUNT(entry_id) AS total_eaten FROM diary_entries WHERE user_id = ? AND created_at >= ? GROUP BY cuisine ORDER BY total_eaten DESC LIMIT 1;`, params),
        
        // d. Price Range Frequency (all prices)
        fetchAll(db, `SELECT price, COUNT(entry_id) AS total_count FROM diary_entries WHERE user_id = ? AND created_at >= ? GROUP BY price ORDER BY total_count DESC;`, params),
        
        // e. Highest-Rated Entry (by taste_rating)
        // Using subquery to find the MAX rating and then get the full entry details
        fetchAll(db, `SELECT title, location, taste_rating FROM diary_entries WHERE user_id = ? AND created_at >= ? ORDER BY taste_rating DESC, created_at DESC LIMIT 1;`, params),
    ];

    // 3. Execute all queries in parallel for performance
    const [
        totalEntries,
        topRestaurant,
        favCuisine,
        priceFrequency,
        highestRated
    ] = await Promise.all(queries);

    // 4. Structure and Return the Final Data
    return {
        // Return 0 if count fails
        totalEntries: totalEntries[0]?.total_entries || 0,
        // Return null if no data found
        topRestaurant: topRestaurant[0] || null,
        favoriteCuisine: favCuisine[0] || null,
        priceFrequency: priceFrequency || [],
        highestRated: highestRated[0] || null,
    };
};

module.exports = { getWrappedData };