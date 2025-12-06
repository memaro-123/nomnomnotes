const express = require('express');
const router = express.Router(); // ← Add this line
const { verifyUser } = require("./middleware/verifyUser.js");


router.get('/maps-key', verifyUser, (req, res) => {
    try {
        const apiKey = process.env.GOOGLE_MAPS_API_KEY;
        
        if (!apiKey) {
            return res.status(500).json({ error: 'Google Maps API key not configured' });
        }
        
        console.log('Sending Google Maps API key');
        res.json({ key: apiKey });
    } catch (error) {
        console.error('Error fetching Maps API key:', error);
        res.status(500).json({ error: 'Failed to fetch API key' });
    }
});


module.exports = router; 