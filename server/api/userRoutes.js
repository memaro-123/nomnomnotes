const express = require('express');
const router = express.Router();
const { verifyUser } = require('./middleware/verifyUser');
const sqlite3 = require("sqlite3");
const { fetchAll, paramExec } = require("../../sqlDB/helperFunctions.js");
const dbFunctions = require("../../sqlDB/dbFunctions.js");
const { validateUserInput, sanitizeInput, rateLimit } = require('./middleware/validateInput');

router.use(verifyUser); // Apply user verification middleware to all routes
router.use(rateLimit()); // Apply rate limiting middleware to all routes
router.use(sanitizeInput); // Apply input sanitization middleware to all routes
router.use(validateUserInput); // Apply input validation middleware to all routes


// This gets the logged-in use's info
router.get("/friends", verifyUser, async (req, res) => {
  const uid = req.user.uid;
  try {
    const friends = await dbFunctions.getFriends(uid);
    res.json({ success: true, friends });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "smths wrong fetching friends" });
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
/*
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
*/
// This gets all pending friend requests for the logged-in user
router.get("/friends/requests", verifyUser, async (req, res) => {
  const uid = req.user.uid;
  try {
    const requests = await dbFunctions.getRecieved(uid);
    res.json({ success: true, requests });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch pending requests" });
  }
});


// This handles accepting or rejecting a friend request
router.patch("/friends/:friendI d", verifyUser, async (req, res) => {
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
router.patch("/makefriend", verifyUser, async (req, res) => {
  //API TO ACCEPT A FRIEND REQ
  const { myID, friendID } = req.body;
  if (!myID || !friendID) {
    return res.status(400).json({ error: "Missing id" });
  }
  if (!(await dbFunctions.userExists({id:friendID}))) {
    return res.status(400).json({ error: "friend doesn't exist" });
  }
  try {
    await dbFunctions.insertNewFriend({ myID, friendID });
    console.log("insertNewFriend jsut ran type shit");

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update friendstuff 2" });
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

router.patch("/updateUsername", verifyUser, async (req, res) => {
  const { myID, newName } = req.body;
  let exists=true
  try {
     exists = await dbFunctions.usernameExists(newName);
  }catch (err) {
    console.error(err);
    return res.status(500).json({ error: "check existance" });
  }

  if (exists){
    return res.status(400).json({ error: "name already taken" });
  }
  if (!myID || !newName)  {
    return res.status(400).json({ error: "Missing id or name" });
  }
  if (!(await dbFunctions.userExists({id:myID}))) {
    return res.status(400).json({ error: "friend doesn't exist" });
  }
  try {
    await dbFunctions.updateUsername({myID, newName })

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to change usrname" });
  }
});
router.get("/getUsername", verifyUser, async (req, res) => {
  const { id } = req.query;
  if (!id)  {
    return res.status(400).json({ error: "Missing id or name" });
  }
  if (!(await dbFunctions.userExists({id:id}))) {
    return res.status(400).json({ error: "you doesn't exist" });
  }
  try {
    const username = await dbFunctions.getUsername(id)

    res.json({ username: username, success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to change usrname" });
  }
});
router.patch("/getUsername", verifyUser, async (req, res) => {
  const { id } = req.query;
  if (!id)  {
    return res.status(400).json({ error: "Missing id or name" });
  }
  if (!(await dbFunctions.userExists({id:id}))) {
    return res.status(400).json({ error: "you doesn't exist" });
  }
  try {
    const username = await dbFunctions.getUsername(id)

    res.json({ username: username, success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to change usrname" });
  }
});
module.exports = router;