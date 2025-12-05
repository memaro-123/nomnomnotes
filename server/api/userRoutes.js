const express = require('express');
const router = express.Router();
const { verifyUser } = require('./middleware/verifyUser');
const sqlite3 = require("sqlite3");
const dbFunctions = require("../../sqlDB/dbFunctions.js");
const { validateUserInput, sanitizeInput, rateLimit } = require('./middleware/validateInput');
const { paramExec, fetchAll,getFirstRow } = require("../helperFunctions.js");

router.use(verifyUser); // Apply user verification middleware to all routes
router.use(rateLimit()); // Apply rate limiting middleware to all routes
router.use(sanitizeInput); // Apply input sanitization middleware to all routes
router.use(validateUserInput); // Apply input validation middleware to all routes



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
router.patch("/makefriend", verifyUser, async (req, res) => {
  console.log('in api')
  console.log('reqbody', req.body)
  //API TO ACCEPT A FRIEND REQ
  const { userId, friendId } = req.body;
  if (!userId || !friendId) {
    console.log('missing ids')
    return res.status(400).json({ error: "Missing id" });
  }
  if (!(await dbFunctions.userExists({id:friendId}))) {
    console.log('friend doesnt exist')
    return res.status(400).json({ error: "friend doesn't exist" });
  }
  try {
    console.log('calling db function userid', userId)
    console.log('calling db function friendid', friendId)
    await dbFunctions.insertNewFriend( { myID: userId, friendID: friendId } );
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
  try {
    const row = await getFirstRow(db, "SELECT friends FROM friends WHERE user_id = ?", [uid]);
    let friends = JSON.parse(row.friends || "[]");
    friends = friends.filter(f => f !== friendId);
    await paramExec(db, "UPDATE friends SET friends = ? WHERE user_id = ?", [JSON.stringify(friends), uid]);
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
    res.status(500).json({ error: "Failed to change username" });
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
router.patch("/getUsernameList", verifyUser, async (req, res) => {
  let idAndUsernames ={}
  let { idArray } = req.body|| {};
  if (!idArray)  {
    return res.status(400).json({ error: "Missing id or name" });
  }
  idArray = Array.isArray(idArray) ? idArray : [idArray];
 
  try {
    for (const id of idArray) {
       if (!(await dbFunctions.userExists({id:id}))) {
        return res.status(400).json({ error: `${id} not found in db` })
  }
      else{
        const username = await dbFunctions.getUsername(id)
        idAndUsernames[id]=username
      } 
    }
    res.json({ usernames: idAndUsernames, success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to change usrname" });
  }
});
router.delete("/delete/:requesterID", verifyUser, async (req, res) => {
  const uid = req.user.uid;
  const { requesterID } = req.params;
  if (!requesterID) {
    return res.status(400).json({ error: "Missing requesterID" });
  }
  try {
    await dbFunctions.removeFromReceivedRequests( uid, requesterID);
    res.json({ success: true, message: "deleted correctly" });
  } catch (err) {
    console.error("Error deleting friend req:", err);
    res.status(500).json({ error: "Failed to delete frind req" });
  }
});


module.exports = router;