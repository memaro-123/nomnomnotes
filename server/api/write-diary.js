const express = require("express");
const { db, admin } = require("../firebase.js");
const { verifyUser } = require("./utils/verifyUser.tsx");
const router = express.Router();


router.post("/", async (req, res) => {
  // authorize user
  const decoded = await verifyUser(req)
  const uid = decoded.uid;

  console.log(req.body)
  const { name, selectedCuisines, city, state, selectedPrices, selectedLabels, images, notes, taste, service, value } = req.body;

  try {
    await db.collection("users").doc(uid).collection("diary").add({
      name,
      selectedCuisines,
      city,
      state,
      selectedPrices,
      selectedLabels,
      images,
      notes,
      taste,
      service,
      value,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to write diary" });
  }
});

module.exports = router;
