const express = require("express");
const router = express.Router();
const sqlite3 = require("sqlite3").verbose();
const { verifyUser } = require("./middleware/verifyUser");
const dbFunctions = require("../../sqlDB/dbFunctions");
const { getBiteBackData } = require("../bitebackQuery");

// Get simplified BiteBack stats
router.get("/biteback", verifyUser, async (req, res) => {
  try {
    const userId = req.user.uid;
    const { year } = req.query;

    const yearNum = year ? parseInt(year) : new Date().getFullYear();
    const result = await getBiteBackData(userId, yearNum);
    res.json(result);
  } catch (err) {
    console.error("Error fetching BiteBack stats:", err);
    res.status(500).json({ 
      success: false, 
      error: "Failed to fetch BiteBack stats"
    });
  }
});

// Get year comparison
router.get("/biteback/years", verifyUser, async (req, res) => {
  try {
    const userId = req.user.uid;
    const db = new sqlite3.Database("my.db");
    
    // Get available years
    const yearsQuery = `
      SELECT DISTINCT strftime('%Y', date) as year
      FROM diary_entries 
      WHERE user_id = ?
      ORDER BY year DESC
    `;
    
    const years = await dbFunctions.fetchAll(db, yearsQuery, [userId]);
    db.close();
    
    // Get stats for each year
    const yearStats = await Promise.all(
      years.map(async ({ year }) => {
        const stats = await dbFunctions.getBiteBackStats(userId, year);
        return stats;
      })
    );
    
    res.json({ success: true, data: yearStats });
  } catch (err) {
    console.error("Error fetching year comparison:", err);
    res.status(500).json({ error: "Failed to fetch year comparison" });
  }
});

router.get("/biteback/debug", verifyUser, async (req, res) => {
  try {
    const userId = req.user.uid;
    const db = new sqlite3.Database("my.db");
    
    // Check if user has any entries
    const entryCount = await fetchAll(db, 
      "SELECT COUNT(*) as count FROM diary_entries WHERE user_id = ?", 
      [userId]
    );
    
    // Get sample entries
    const sampleEntries = await fetchAll(db,
      "SELECT location, date FROM diary_entries WHERE user_id = ? LIMIT 5",
      [userId]
    );
    
    db.close();
    
    res.json({
      userId,
      totalEntries: entryCount[0]?.count || 0,
      sampleEntries: sampleEntries.map(e => ({
        location: e.location,
        city: extractCity(e.location),
        date: e.date
      }))
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;