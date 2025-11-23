const express = require('express');
const router = express.Router();
const db = require('../../sqlDB/dbFunctions'); 
const { verifyUser } = require('./middleware/verifyUser'); 

router.get('/info', verifyUser, async (req, res) => {
  try {
    const uid = req.user.uid;
    const userInfo = await db.getUserByUID(uid);

    if (!userInfo) return res.status(404).json({ message: 'User not found' });

    const parsedPermissions = typeof userInfo.permissions === 'string' 
      ? JSON.parse(userInfo.permissions) 
      : userInfo.permissions;

    res.json({
      username: userInfo.username,
      permissions: parsedPermissions
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;