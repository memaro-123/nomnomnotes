const express = require("express");
const { db, admin } = require("../firebase.js");
const { verifyUser } = require("./utils/verifyUser.tsx");
const router = express.Router();


router.get("/", async (req, res) => {
  try{
    // authorize user
    const decoded = await verifyUser(req)
    const uid = decoded.uid;

    const diaryRef = await db.collection("users").doc(uid).collection("diary");
    const diarySnapshot = await diaryRef.get();

    const diaryData = diarySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
    }));

    res.json({ success: true, diaryData });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch diary" });
  }
});

module.exports = router;