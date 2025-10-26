const express = require("express");
const admin = require("firebase-admin");
const router = express.Router();

// notice the path here is just "/" — not "/api/write-diary"
router.post("/", async (req, res) => {
  console.log(req.body)
  const { name, selectedCuisines, city, state, selectedPrices, selectedLabels, images, notes, taste, service, value } = req.body;

  try {
    const uid = "test-user";
    await admin.firestore().collection("users").doc(uid).collection("diary").add({
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
