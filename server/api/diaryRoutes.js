const { insertEntry, editEntry, getAllEntries, deleteEntry} = require("../../sqlDB/dbFunctions.js");
const express = require("express");
const { db, admin } = require("../firebase.js");
const { verifyUser } = require("./middleware/verifyUser.js");
const router = express.Router();

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

router.patch("/edit", verifyUser, async (req, res) => {
  const uid = req.user.uid
  const { entryId, title, selectedCuisines, location, 
    selectedPrices, selectedLabels, images, notes, taste, 
    service, value } = req.body;
  if (!entryId) {
  return res.status(400).json({ error: "Missing entryId" });
}
  try {
    await editEntry({
      id: entryId,
      user_id: uid,
      title,
      selectedCuisines,
      location,
      selectedPrices,
      selectedLabels,
      images,
      notes,
      taste,
      service,
      value
    });
    console.log("edit entry success")

  res.json({ success: true });
} catch (err) {
  console.error(err);
  res.status(500).json({ error: "Failed to update diary entry" });
}
})

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
