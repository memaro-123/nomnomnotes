// File: server/wrappedQuery.js; meant to make it easier to generate spotify wrapped knockoff reports for the user's food diary, named BiteBack 
// realized that generating the report live would maybe strain the database since it is a bunch of queries, so perhaps it is better if this is something that happens once a set time period for all users and saves the data into a new 
//  that way when the user wants their report, the api endpoint can simply fetch the precalculated data and make it load faster
const { fetchAll } = require('../sqlDB/helperFunctions');
const db = require('../sqlDB/index').db;

/**
 * Generates comprehensive "BiteBack" analytics for a user's food diary
 * @param {string} userId - Firebase UID
 * @param {number} year - Year to analyze (e.g., 2024)
 * @returns {object} Structured analytics data
 */
const getBiteBackData = async (userId, year = new Date().getFullYear()) => {
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
            bestRated
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
                params)
        ]);

        // 9. Format and structure the response
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
 * Precalculates and stores BiteBack data for all users
 * Should be run periodically (e.g., via cron job at year-end)
 */
const precalculateAllBiteBacks = async () => {
    const currentYear = new Date().getFullYear();
    
    // Get all active users (simplified - you'd need a users table)
    const users = await fetchAll(db, `
        SELECT DISTINCT user_id FROM diary_entries 
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
};

module.exports = { getBiteBackData, precalculateAllBiteBacks };