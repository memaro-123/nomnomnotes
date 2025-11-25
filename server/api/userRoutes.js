const express = require('express');
const router = express.Router();
const { verifyUser } = require('./middleware/verifyUser');
const sqlite3 = require("sqlite3");
const { fetchAll, paramExec } = require("../../sqlDB/helperFunctions.js");
const dbFunctions = require("../../sqlDB/dbFunctions.js");

// This gets the logged-in use's info
router.get('/info', verifyUser, async (req, res) => {
  try {
    const uid = req.user.uid;
    const userInfo = await dbFunctions.getUserByUID(uid);

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

// This gets all of the accepted friends
router.get("/friends", verifyUser, async (req, res) => {
  const uid = req.user.uid;
  const db = new sqlite3.Database("my.db");
  const sql = `
    SELECT 
      CASE WHEN f.requester_id = ? THEN f.receiver_id ELSE f.requester_id END AS friend_id,
      u.username
    FROM friends f
    JOIN users u ON u.uid = CASE WHEN f.requester_id = ? THEN f.receiver_id ELSE f.requester_id END
    WHERE (f.requester_id = ? OR f.receiver_id = ?)
      AND f.status = 'accepted'
  `;
  try {
    const friends = await fetchAll(db, sql, [uid, uid, uid, uid]);
    res.json({ success: true, friends });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch friends" });
  } finally {
    db.close();
  }
});

// Handles sending a friend request
router.post("/friends/request", verifyUser, async (req, res) => {
  const uid = req.user.uid;
  const { friendId } = req.body;
  if (!friendId) return res.status(400).json({ error: "Missing friendId" });

  const db = new sqlite3.Database("my.db");
  const sql = `INSERT INTO friends (requester_id, receiver_id, status) VALUES (?, ?, 'pending')`;

  try {
    await paramExec(db, sql, [uid, friendId]);
    res.json({ success: true, message: "Friend request sent" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to send friend request" });
  } finally {
    db.close();
  }
});

// This gets all pending friend requests for the logged-in user
router.get("/friends/requests", verifyUser, async (req, res) => {
  const uid = req.user.uid;
  const db = new sqlite3.Database("my.db");
  const sql = `
    SELECT f.requester_id AS requesterId, u.username
    FROM friends f
    JOIN users u ON u.uid = f.requester_id
    WHERE f.receiver_id = ? AND f.status = 'pending'
  `;
  try {
    const requests = await fetchAll(db, sql, [uid]);
    res.json({ success: true, requests });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch friend requests" });
  } finally {
    db.close();
  }
});

// This handles accepting or rejecting a friend request
router.patch("/friends/:friendId", verifyUser, async (req, res) => {
  const uid = req.user.uid;
  const { friendId } = req.params;
  const { action } = req.body; // should be 'accept' or 'reject'
  if (!action || !["accept", "reject"].includes(action)) {
    return res.status(400).json({ error: "Invalid action" });
  }

  const db = new sqlite3.Database("my.db");
  const sql = `UPDATE friends SET status = ? WHERE requester_id = ? AND receiver_id = ?`;

  try {
    const newStatus = action === "accept" ? "accepted" : "rejected";
    await paramExec(db, sql, [newStatus, friendId, uid]);
    res.json({ success: true, message: `Friend request ${newStatus}` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update friend request" });
  } finally {
    db.close();
  }
});

// This handles removing a friend (i dont think we need a block feature for this app)
router.delete("/friends/:friendId", verifyUser, async (req, res) => {
  const uid = req.user.uid;
  const { friendId } = req.params;
  const db = new sqlite3.Database("my.db");
  const sql = `
    DELETE FROM friends
    WHERE (requester_id = ? AND receiver_id = ?) 
       OR (requester_id = ? AND receiver_id = ?)
  `;
  try {
    await paramExec(db, sql, [uid, friendId, friendId, uid]);
    res.json({ success: true, message: "Friend removed" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to remove friend" });
  } finally {
    db.close();
  }
});

module.exports = router;