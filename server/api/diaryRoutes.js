const { insertEntry, editEntry, getAllEntries, deleteEntry} = require("../../sqlDB/dbFunctions.js");
const express = require("express");
const { db, admin } = require("../firebase.js");
const { verifyUser } = require("./middleware/verifyUser.tsx");
const router = express.Router();
/*
router.get("/", verifyUser, async (req, res) => {
  try{
    const uid = req.user.uid;

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
*/
router.get( "/", verifyUser, async (req, res) => {
  try{
    const uid = req.user.uid
    const entries = await getAllEntries(uid) 

    res.json({ success: true, diaryData: entries })
  }
  catch(err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch diary" });
  }
} )
/*
router.post("/create", verifyUser, async (req, res) => {
  const uid = req.user.uid;

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
*/
router.post( "/create", verifyUser, async (req, res)=> {
  const uid = req.user.uid

  try{
    const entryData = { ...req.body, user_id: uid }
    await insertEntry(entryData)
    res.json({ success: true })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: "Failed to write diary" });
  }
})
/*
router.patch("/edit", verifyUser, async (req, res) => {
  const uid = req.user.uid;

  console.log(req.body)
  const { entryId, name, selectedCuisines, city, state, selectedPrices, selectedLabels, images, notes, taste, service, value } = req.body

  if (!entryId) {
    return res.status(400).json({ error: "Missing entryId" });
  }

  try {
    const entryRef = await db.collection("users").doc(uid).collection("diary").doc(entryId);
    
    await entryRef.update({
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
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update diary" });
  }
});
*/
router.patch("/edit", verifyUser, async (req, res) => {
  const uid = req.user.uid
  const { entryId, name, selectedCuisines, city, state, selectedPrices, selectedLabels, images, notes, taste, service, value } = req.body
  if (!entryId) {
  return res.status(400).json({ error: "Missing entryId" });
}
  try {
  await editEntry({
    id: entryId,
    user_id: uid,
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
    value
  });
  console.log("editentry jsut ran type shit")

  res.json({ success: true });
} catch (err) {
  console.error(err);
  res.status(500).json({ error: "Failed to update diary entry" });
}


})
/*
router.delete("/delete/:entryId", verifyUser, async (req, res) => {
  const uid = req.user.uid;
  const { entryId } = req.params;

  if (!entryId) {
    return res.status(400).json({ error: "Missing entryId" });
  }

  try {
    const entryRef = db.collection("users").doc(uid).collection("diary").doc(entryId);
    await entryRef.delete();

    res.json({ success: true, message: "Diary entry deleted successfully" });
  } catch (err) {
    console.error("Error deleting diary entry:", err);
    res.status(500).json({ error: "Failed to delete diary entry" });
  }
});
*/
router.delete("/delete/:entryId", verifyUser, async (req, res) => {
  const uid = req.user.uid;
  const { entryId } = req.params
  if (!entryId) {
    return res.status(400).json({ error: "Missing entryId" });
  }
  try {
    await deleteEntry(entryId, uid)
    res.json({ success: true, message: "deleted correctly" })
  } catch (err) {
    console.error("Error deleting diary entry:", err)
    res.status(500).json({ error: "Failed to delete diary entry" });
  }

}
)
module.exports = router;
